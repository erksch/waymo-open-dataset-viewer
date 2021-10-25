import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveSegment } from '../state/configReducer';
import { AppState } from '../state/rootReducer';

const port = 9000;

function useWebsocket() {
  const dispatch = useDispatch();
  const websocket = useMemo(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.binaryType = 'arraybuffer';
    return ws;
  }, []);
  const activeSegmentId = useSelector(
    (state: AppState) => state.config.activeSegmentId,
  );
  const activeSegment = useActiveSegment();
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading available segments...');

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setRefresh(!refresh);
  };

  useEffect(() => {
    if (activeSegmentId) {
      setIsLoading(true);
      setStatus(`Loading segment ${activeSegmentId}`);
      websocket.send(`${activeSegmentId}_0_segment`);
      websocket.send(`${activeSegmentId}_0_pointcloud`);
      websocket.send(`${activeSegmentId}_0_labels`);
    }
  }, [websocket, activeSegmentId]);

  useEffect(() => {
    const handleError = () => {
      setIsLoading(false);
      setError(
        `Could not connect to websocket on port ${port}.\nMake sure it's running.`,
      );
    };

    const handleSegmentsMessage = (segmentIds: string[]) => {
      dispatch({ type: 'SEGMENT_IDS_RECEIVED', segmentIds });
    };

    const handleSegmentMetadataMessage = ([
      segmentId,
      size,
      path,
    ]: string[]) => {
      dispatch({
        type: 'SEGMENT_METADATA_RECEIVED',
        segmentId,
        metadata: {
          size: Number(size),
          path,
        },
      });
    };

    const handlePointCloudMessage = (
      segmentId: string,
      frameTimestamp: number,
      frameIndex: number,
      data: Float32Array,
    ) => {
      setIsLoading(false);
      setStatus('');

      if (!activeSegment || !activeSegment.metadata) return;

      if (segmentId.substr(0, 5) !== activeSegment.id.substr(0, 5)) {
        return;
      }

      if (frameIndex < activeSegment.metadata.size - 1) {
        websocket.send(`${activeSegment.id}_${frameIndex + 1}_pointcloud`);
      }

      const offsets: number[] = [];
      const intensities: number[] = [];
      const lasers: number[] = [];
      const labels: number[] = [];
      const predictedLabels: number[] = [];

      data.forEach((x, index) => {
        if ([0, 1, 2].includes(index % 6)) offsets.push(x);
        else if (index % 6 === 3) intensities.push(x);
        else if (index % 6 === 4) lasers.push(x);
        else if (index % 6 === 5) labels.push(x);
        if (index % 6 === 0) predictedLabels.push(-1);
      });

      dispatch({
        type: 'SEGMENT_POINTS_RECEIVED',
        segmentId: activeSegment.id,
        frameTimestamp,
        frameIndex,
        points: {
          offsets,
          intensities,
          lasers,
          labels,
          predictedLabels,
        },
      });
    };

    const handleBoundingBoxesMessage = (
      segmentId: string,
      frameTimestamp: number,
      frameIndex: number,
      data: Float32Array,
    ) => {
      if (!activeSegment || !activeSegment.metadata) return;

      if (segmentId.substr(0, 5) !== activeSegment.id.substr(0, 5)) {
        return;
      }

      if (frameIndex < activeSegment.metadata.size) {
        // websocket.send(`${activeSegment.id}_${frameIndex + 1}_labels`);
      }

      const numCols = 8;
      const offsets: number[] = [];
      const dimensions: number[] = [];
      const headings: number[] = [];

      data.forEach((x, index) => {
        if ([0, 1, 2].includes(index % numCols)) offsets.push(x);
        else if ([3, 4, 5].includes(index % numCols)) dimensions.push(x);
        else if (index % numCols === 6) headings.push(x);
      });

      dispatch({
        type: 'SEGMENT_BOUNDING_BOXES_RECEIVED',
        segmentId: activeSegment.id,
        frameTimestamp,
        frameIndex,
        boundingBoxes: {
          offsets,
          dimensions,
          headings,
        },
      });
    };

    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const [typeStr, ...data] = event.data.split(',');
        const type = Number(typeStr);

        if (type === 0) {
          // Received supported segment ids
          handleSegmentsMessage(data);
        } else if (type === 1) {
          // Received segment metadata
          handleSegmentMetadataMessage(data);
        }
      } else {
        const [type, segmentId, frameTimestamp, frameIndex, ...rest] =
          new Float32Array(event.data);
        const data = new Float32Array(rest);

        if (type === 0) {
          // Received binary point cloud data
          handlePointCloudMessage(
            segmentId.toString(),
            frameTimestamp,
            frameIndex,
            data,
          );
        } else if (type === 1) {
          // Received binary bounding box data
          handleBoundingBoxesMessage(
            segmentId.toString(),
            frameTimestamp,
            frameIndex,
            data,
          );
        }
      }
    };

    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('error', handleError);

    return () => {
      websocket.removeEventListener('error', handleError);
      websocket.removeEventListener('message', handleMessage);
    };
  }, [dispatch, websocket, activeSegment, refresh]);

  return {
    isLoading,
    error,
    retry,
    status,
  };
}

export default useWebsocket;
