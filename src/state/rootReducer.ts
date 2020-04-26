import { AnyAction, combineReducers } from "redux";
import { useSelector } from "react-redux";
import segmentsReducer, { State as SegmentsState } from './segmentsReducer';
import configReducer, { State as ConfigState } from './configReducer';

export interface AppState {
  config: ConfigState;
  segments: SegmentsState;
}

const rootReducer = combineReducers({
  config: configReducer,
  segments: segmentsReducer,
})

export default rootReducer;