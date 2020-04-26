import { AnyAction } from "redux";
import { AppState } from "./rootReducer";
import { ColorMode, LabelMode, ObjectDetectionDataMode } from "../constants";
import { useSelector } from "react-redux";

export type Laser = 'TOP' | 'FRONT' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'REAR';

export interface State {
  activeSegmentId: string | null;
  activeFrame: number;
  lasers: { [laser in Laser]: boolean };
  colorMode: ColorMode;
  labelMode: LabelMode;
  objectDetectionServerUrl: string;
  objectDetectionDataMode: ObjectDetectionDataMode;
  segmentationServerUrl: string;
  segmentationDataMode: ObjectDetectionDataMode;
}

const initialState: State = {
  activeSegmentId: null,
  activeFrame: -1,
  lasers: {
    TOP: true,
    FRONT: true,
    SIDE_LEFT: true,
    SIDE_RIGHT: true,
    REAR: true,
  },
  colorMode: ColorMode.LABEL,
  labelMode: LabelMode.GROUND_TRUTH,
  objectDetectionServerUrl: '',
  objectDetectionDataMode: ObjectDetectionDataMode.SEGMENT_PATH,
  segmentationServerUrl: '',
  segmentationDataMode: ObjectDetectionDataMode.SEGMENT_PATH,
};

function configReducer(state: State = initialState, action: AnyAction) {
  switch (action.type) {
    case 'SEGMENT_POINTS_RECEIVED':
      return {
        ...state,
        activeFrame: state.activeFrame === -1 ? action.frameIndex : state.activeFrame,
      }
    case 'SET_ACTIVE_SEGMENT':
      return {
        ...state,
        activeSegmentId: action.segmentId,
      };
    case 'SEGMENT_IDS_RECEIVED':
      return {
        ...state,
        activeSegmentId: action.segmentIds[0],
      };
    case 'SET_ACTIVE_FRAME':
      return {
        ...state,
        activeFrame: action.frame,
      };
    case 'TOGGLE_LASER':
      return {
        ...state,
        lasers: { ...state.lasers, [action.laser]: !state.lasers[action.laser as Laser] },
      };
    case 'SET_COLOR_MODE':
      return {
        ...state,
        colorMode: action.mode,
      };
    case 'SET_LABEL_MODE':
      return {
        ...state,
        labelMode: action.mode,
      };
    case 'SET_OBJECT_DETECTION_SERVER_URL':
      return {
        ...state,
        objectDetectionServerUrl: action.url,
      };
    case 'SET_OBJECT_DETECTION_DATA_MODE':
      return {
        ...state,
        objectDetectionDataMode: action.mode,
      };
    case 'SET_SEGMENTATION_SERVER_URL':
      return {
        ...state,
        segmentationServerUrl: action.url,
      };
    case 'SET_SEGMENTATION_DATA_MODE':
      return {
        ...state,
        segmentationDataMode: action.mode,
      };
    default:
      return state;
  }
}

export function useConfig() {
  return useSelector((state: AppState) => state.config);
}

export function useActiveSegment() {
  return useSelector((state: AppState) => state.segments.items.find((segment) => segment.id === state.config.activeSegmentId));
}

export default configReducer;
