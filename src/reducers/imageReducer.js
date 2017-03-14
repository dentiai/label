import {
  LOAD_BOXES,
  DRAW_NEW_BOX,
  ADD_NEW_BOX,
  UPDATE_BOX,
  DELETE_BOX,
  ADD_BOX_LABEL,
  TOGGLE_BOX_LABEL,
  DELETE_BOX_LABEL,
} from '../actions';

const INIT_STATE = {
  boxes: [],
  newBox: null,
}

export default (state = INIT_STATE, action) => {
  let { boxes } = state;
  let boxLabels = [];
  let labelIndex = null;

  switch (action.type) {
    case LOAD_BOXES:
      return { ...state, boxes: action.payload };

    case DRAW_NEW_BOX:
      return { ...state, newBox: action.payload };

    case ADD_NEW_BOX:
      boxes.push(state.newBox);

      return { ...state, boxes, newBox: null };

    case UPDATE_BOX:
      boxes[action.payload.index] = action.payload.newDimensions;

      return { ...state, boxes };

    case DELETE_BOX:
      boxes.splice(action.payload, 1);

      return { ...state, boxes };

    case ADD_BOX_LABEL:
      boxLabels = boxes[action.payload.index].labels || [];
      boxLabels.push(action.payload.label);

      boxes[action.payload.index].labels = boxLabels;

      return { ...state, boxes };

    case TOGGLE_BOX_LABEL:
      boxLabels = boxes[action.payload.index].labels || [];
      labelIndex = boxLabels.indexOf(action.payload.label);

      if (labelIndex > -1) {
        boxLabels.splice(labelIndex, 1);
      } else {
        boxLabels.push(action.payload.label);
      }

      boxes[action.payload.index].labels = boxLabels;

      return { ...state, boxes };

    case DELETE_BOX_LABEL:
      boxLabels = boxes[action.payload.index].labels || [];
      labelIndex = boxLabels.indexOf(action.payload.label);

      if (labelIndex > -1) {
        boxLabels.splice(labelIndex, 1);
      }

      boxes[action.payload.index].labels = boxLabels;

      return { ...state, boxes };

    default: return state;
  }
}
