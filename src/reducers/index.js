import { combineReducers } from 'redux';
import imageReducer from './imageReducer';
import labelReducer from './labelReducer';

export default combineReducers({
  image: imageReducer,
  labels: labelReducer,
});
