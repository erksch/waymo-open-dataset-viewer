import { AnyAction } from "redux";
import { useSelector } from "react-redux";
import { AppState } from "./rootReducer";

interface Segment {
  id: string;
  metadata?: {
    size: number;
    path: string;
  };
  frames: Array<{
    timestamp: number;
    points?: {
      offsets: number[];
      intensities: number[];
      lasers: number[];
      labels: number[];
      predictedLabels: number[];
    };
    boundingBoxes?: {
      offsets: number[];
      dimensions: number[];
      headings: number[];
    };
    predictedBoundingBoxes?: {
      offsets: number[];
      dimensions: number[];
      headings: number[];
    };
  }>;
}

export interface State {
  items: Segment[];
}

const initialState: State = {
  items: [],
};

function segmentsReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case 'SEGMENT_IDS_RECEIVED':
      return {
        ...state,
        items: action.segmentIds.map((id: string) => ({ id, frames: [] })),
      };
    case 'SEGMENT_METADATA_RECEIVED':
      return {
        ...state,
        items: state.items.map((segment) => {
          if (segment.id === action.segmentId) {
            return {
              ...segment,
              metadata: action.metadata,
            };
          }
          return segment;
        }),
      };
    case 'SEGMENT_POINTS_RECEIVED':
      return {
        ...state,
        items: state.items.map((segment) => {
          if (segment.id === action.segmentId) {
            return {
              ...segment,
              frames: (() => {
                const { frames } = segment;
                frames[action.frameIndex] = { 
                  ...frames[action.frameIndex], 
                  timestamp: action.frameTimestamp,
                  points: action.points,
                };
                return frames;
              })(),
            };
          }
          return segment;
        }),
      };
    case 'SEGMENT_BOUNDING_BOXES_RECEIVED':
      return {
        ...state,
        items: state.items.map((segment) => {
          if (segment.id === action.segmentId) {
            return {
              ...segment,
              frames: (() => {
                const { frames } = segment;
                frames[action.frameIndex] = { 
                  ...frames[action.frameIndex], 
                  timestamp: action.frameTimestamp,
                  boundingBoxes: action.boundingBoxes,
                };
                return frames;
              })(),
            };
          }
          return segment;
        }),
      };
    case 'SEGMENT_PREDICTED_BOUNDING_BOXES_RECEIVED':
      return {
        ...state,
        items: state.items.map((segment) => {
          if (segment.id === action.segmentId) {
            return {
              ...segment,
              frames: (() => {
                const { frames } = segment;
                frames[action.frameIndex] = { 
                  ...frames[action.frameIndex], 
                  predictedBoundingBoxes: action.boundingBoxes, 
                };
                return frames;
              })(),
            };
          }
          return segment;
        }),
      };
    case 'SEGMENT_PREDICTED_LABELS_RECEIVED':
      return {
        ...state,
        items: state.items.map((segment) => {
          if (segment.id === action.segmentId) {
            return {
              ...segment,
              frames: (() => {
                const { frames } = segment;
                const frame = frames[action.frameIndex];
                const { points } = frame;

                frames[action.frameIndex] = { 
                  ...frame, 
                  points: points && {
                    ...points,
                    predictedLabels: action.labels, 
                  },
                };
                return frames;
              })(),
            };
          }
          return segment;
        }),
      };
    default:
      return state;
  }
} 

export function useSegments() {
  return useSelector((state: AppState) => state.segments.items);
}

export default segmentsReducer;
