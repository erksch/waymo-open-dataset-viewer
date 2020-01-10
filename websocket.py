import argparse
import json
import logging
import tensorflow as tf
import numpy as np
from functools import partial
import math
import os
import json
import asyncio
import re
import websockets

print(f"Tensorflow Version: {tf.__version__}")

from waymo_open_dataset.utils import frame_utils, box_utils, transform_utils
from waymo_open_dataset import dataset_pb2 as open_dataset

global_settings = dict()
global_settings['segments_dir'] = ''
global_settings['label_points'] = False

def get_segment_id(segment_filename):
  return re.search('\w+-(\d+)_.*', segment_filename).group(1)

def get_segment_filename(segment_id):
  segment_filenames = os.listdir(global_settings['segments_dir'])
  return [filename for filename in segment_filenames if segment_id in filename][0]

def get_intensities(range_images):
  intensities = []
  
  for laser_name, range_image_returns in range_images.items():
    range_image, _ = range_image_returns
    range_image_tensor =  tf.reshape(
        tf.convert_to_tensor(range_image.data),
        range_image.shape.dims)
    intensity_tensor = tf.reshape(range_image_tensor[...,1], [-1])
    intensity_mask_tensor = tf.greater_equal(intensity_tensor, 0)
    intensity_tensor = tf.squeeze(tf.gather(intensity_tensor, tf.where(intensity_mask_tensor)))
    intensities.append(intensity_tensor.numpy())
      
  return np.array(intensities)

def is_within_box_3d(point, box, name=None):
  """
  Checks whether a point is in a 3d box given a set of points and boxes.
  Args:
    point: [N, 3] tensor. Inner dims are: [x, y, z].
    box: [M, 8] tensor. Inner dims are: [center_x, center_y, center_z, length,
      width, height, heading].
    name: tf name scope.
  Returns:
    point_in_box; [N, M] boolean tensor.
  """

  with tf.compat.v1.name_scope(name, 'IsWithinBox3D', [point, box]):
    center = box[:, 0:3]
    dim = box[:, 3:6]
    heading = box[:, 6]
    label = box[:, 7]
    # [M, 3, 3]
    rotation = transform_utils.get_yaw_rotation(heading)
    # [M, 4, 4]
    transform = transform_utils.get_transform(rotation, center)
    # [M, 4, 4]
    transform = tf.linalg.inv(transform)
    # [M, 3, 3]
    rotation = transform[:, 0:3, 0:3]
    # [M, 3]
    translation = transform[:, 0:3, 3]

    # [N, M, 3]
    point_in_box_frame = tf.einsum('nj,mij->nmi', point, rotation) + translation
    # [N, M, 3]
    point_in_box = tf.logical_and(point_in_box_frame <= dim * 0.5,
                                  point_in_box_frame >= -dim * 0.5)
    # [N, M]
    point_in_box = tf.reduce_prod(input_tensor=tf.cast(point_in_box, dtype=tf.uint8), axis=-1)
    point_labels = tf.reduce_max(point_in_box * tf.cast(label, dtype=tf.uint8), axis=-1)
    
    return point_labels

async def transmit_labels(websocket, segment_id, frame_index):
  record_path = os.path.join(global_settings['segments_dir'], get_segment_filename(segment_id)) 
  dataset = tf.data.TFRecordDataset([record_path])
  dataset = dataset.skip(frame_index).take(1)
  frame = None

  for data in dataset:
    frame = open_dataset.Frame()
    frame.ParseFromString(bytearray(data.numpy()))

  output = [1, float(int(segment_id)), float(frame_index)]

  for label in frame.laser_labels:
      output.extend((label.box.center_x, label.box.center_y, label.box.center_z, label.box.width, label.box.height, label.box.length, label.box.heading, label.type))
      
  bytes = np.array(output, dtype=np.float32).tobytes()
  print(f"Sending segment {segment_id} frame {frame_index} labels")
  await websocket.send(bytes)

async def transmit_frame(websocket, segment_id, frame_index):
  record_path = os.path.join(global_settings['segments_dir'], get_segment_filename(segment_id)) 
  dataset = tf.data.TFRecordDataset([record_path])
  dataset = dataset.skip(frame_index).take(1)
  frame = None

  for data in dataset:
    frame = open_dataset.Frame()
    frame.ParseFromString(bytearray(data.numpy()))

  (range_images, camera_projections, range_image_top_pose) = frame_utils.parse_range_image_and_camera_projection(frame)
    
  intensities = get_intensities(range_images)
  intensities_all = np.concatenate(intensities, axis=0)

  points, _ = frame_utils.convert_range_image_to_point_cloud(
      frame,
      range_images,
      camera_projections,
      range_image_top_pose)

  num_points_per_laser = [len(laser_points) for laser_points in points]

  points_all = np.concatenate(points, axis=0)

  if global_settings['label_points']:
    boxes = np.array([[
      l.box.center_x, 
      l.box.center_y, 
      l.box.center_z, 
      l.box.length, 
      l.box.width, 
      l.box.height, 
      l.box.heading,
      l.type,
    ] for l in frame.laser_labels])
    
    points = np.array(points_all)
    point_labels = is_within_box_3d(
        tf.convert_to_tensor(points, dtype=tf.double), 
        tf.convert_to_tensor(boxes, dtype=tf.double)
    ).numpy()

  output = [0, float(int(segment_id)), float(frame_index)]

  current_laser = 0
  last_laser_index = 0

  for index, point in enumerate(points_all):
    if index - last_laser_index > num_points_per_laser[current_laser] - 1:
      current_laser += 1
      last_laser_index = index
    label = point_labels[index] if global_settings['label_points'] else 0
    x, y, z = point
    intensity = intensities_all[index]
    output.extend((x, y, z, intensity, current_laser, label))

  bytes = np.array(output, dtype=np.float32).tobytes()
  
  print(f"Sending segment {segment_id} frame {frame_index} points")
  await websocket.send(bytes)

async def transmit_segment_metadata(websocket, segment_id):
  record_path = os.path.join(global_settings['segments_dir'], get_segment_filename(segment_id)) 
  dataset = tf.data.TFRecordDataset([record_path])
  size = 0
  for data in dataset: size += 1

  print(f"Sending segment {segment_id} metadata")
  output = np.array([2, float(int(segment_id)), 0, float(size)], dtype=np.float32)
  await websocket.send(output.tobytes())

async def handleMessage(websocket, message):
  [segment_id, frame_index, type] = re.search('(\d+)_(\d+)_(\w+)', message).groups()

  if type == "segment":
    await transmit_segment_metadata(websocket, segment_id)
  elif type == "pointcloud":
    await transmit_frame(websocket, segment_id, int(frame_index))
  elif type == "labels":
    await transmit_labels(websocket, segment_id, int(frame_index))

def main(args):
  global_settings['segments_dir'] = args.segments_dir
  global_settings['label_points'] = args.label_points

  print(f"Should label points: {args.label_points}")

  segment_filenames = os.listdir(args.segments_dir)
  segment_ids = [get_segment_id(filename) for filename in segment_filenames]

  async def server(websocket, path):
    await websocket.send(','.join([segment_id for segment_id in segment_ids]))

    async for message in websocket:
      await handleMessage(websocket, message)
      
  print(f"Running websocket on port {args.port}...")

  start_server = websockets.serve(server, 'localhost', args.port)
  asyncio.get_event_loop().run_until_complete(start_server)
  asyncio.get_event_loop().run_forever()

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description='A server that opens a websocket which serves waymo open dataset segments.')

  parser.add_argument('--segments-dir', type=str, required=True,
                      help='Directory containing the segments (.tfrecord files) to serve.')
  parser.add_argument('--label-points', action='store_true', default=False,
                      help='Whether or not to convert label bounding boxes to point labels (takes more computation time).')
  parser.add_argument('--port', type=str, default=9000,
                      help='Port to run the websocket server on.')

  args = parser.parse_args()
  main(args)
