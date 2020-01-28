import React, { useState } from 'react';
import axios from 'axios';
import { useConfig, useActiveSegment } from '../../state/configReducer';
import { useDispatch } from 'react-redux';
import Button from '../utility/Button';
import Input from '../utility/Input';
import Switch from '../utility/Switch';
import { ObjectDetectionDataMode } from '../../constants';

const SegmentationPrediction: React.FC = () => {
  const dispatch = useDispatch();
  const config = useConfig();
  const activeSegment = useActiveSegment();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { activeFrame, activeSegmentId } = useConfig();

  const handleClick = async () => {
    if (!activeSegment || !activeSegment.metadata) return;

    setHasError(false);
    setIsLoading(true);

    try {
      const { data: labels } = await axios.post(
        `${config.segmentationServerUrl}/predict`,
        {
          recordPath: activeSegment.metadata.path,
          frameIndex: activeFrame,
        },
      );

      dispatch({
        type: 'SEGMENT_PREDICTED_LABELS_RECEIVED',
        segmentId: activeSegmentId,
        frameIndex: activeFrame,
        labels
      });
    } catch (error) {
      setHasError(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      {hasError && <span>An error occured. Please try again.</span>}
      {/*
      <span
        style={{
          color: 'hsl(0, 0%, 80%)',
          fontSize: '13px',
          marginBottom: '8px',
        }}
      >
        Determine which data should be send to the detection server: path to the
        segment and frame index or the point cloud data.
      </span>
      <Switch
        selected={config.objectDetectionDataMode}
        style={{ marginBottom: '6px' }}
        optionStyle={{ fontSize: '14px' }}
        options={[
          {
            value: ObjectDetectionDataMode.SEGMENT_PATH,
            caption: 'Segment Path',
            onChange: () =>
              dispatch({
                type: 'SET_OBJECT_DETECTION_DATA_MODE',
                mode: ObjectDetectionDataMode.SEGMENT_PATH,
              }),
          },
          {
            value: ObjectDetectionDataMode.POINT_CLOUD,
            caption: 'Point Cloud',
            onChange: () =>
              dispatch({
                type: 'SET_OBJECT_DETECTION_DATA_MODE',
                mode: ObjectDetectionDataMode.POINT_CLOUD,
              }),
          },
        ]}
      />
      */}
      <Input
        value={config.segmentationServerUrl}
        placeholder="Prediction Server URL"
        onChange={e =>
          dispatch({
            type: 'SET_SEGMENTATION_SERVER_URL',
            url: e.target.value,
          })
        }
        style={{ marginBottom: '14px' }}
      />
      <Button onClick={handleClick}>
        {isLoading ? 'Loading...' : 'Run Prediction'}
      </Button>
    </>
  );
};

export default SegmentationPrediction;
