import { copyJSON } from '../util/helpers';

import {
  LOAD_IMAGE,
  CLEAR_IMAGE,
  REVERT_IMAGE,
  DRAW_NEW_BOX,
  ADD_NEW_BOX,
  CLEAR_NEW_BOX,
  UPDATE_BOX,
  DELETE_BOX,
  ADD_BOX_LABEL,
  TOGGLE_BOX_LABEL,
  DELETE_BOX_LABELS,
} from '../actions';

const INIT_STATE = {
  boxes: [],
  newBox: null,

  prevBoxes: [],
  history: null,
}

export default (state = INIT_STATE, action) => {
  let boxes = copyJSON(state.boxes);
  let boxLabels = [];
  let labelIndex = null;

  switch (action.type) {
    case LOAD_IMAGE:
      return {
        ...state,
        boxes: copyJSON(action.payload.boxes) || [],
        prevBoxes: copyJSON(action.payload.boxes) || [],
        history: copyJSON(action.payload.history) || null,
      };

    case CLEAR_IMAGE: return INIT_STATE;

    case REVERT_IMAGE:
      boxes = copyJSON(state.prevBoxes);

      return { ...state, boxes };

    case DRAW_NEW_BOX:
      return { ...state, newBox: action.payload };

    case ADD_NEW_BOX:
      const { startX, startY, endX, endY } = state.newBox;

      // normalize box dimensions so that the end corner dimensions are always
      // greater in value than the start corner dimensions
      if (startX > endX) {
        [startX, endX] = [endX, startX];
      }
      if (startY > endY) {
        [startY, endY] = [endY, startY];
      }

      const newBox = { startX, startY, endX, endY };

      if (state.newBox.labels) {
        newBox.labels = state.newBox.labels;
      }

      boxes.push(newBox);

      return { ...state, boxes, newBox: null };

    case CLEAR_NEW_BOX:
      return { ...state, newBox: null };

    case UPDATE_BOX:
      boxes[action.payload.index] = { ...boxes[action.payload.index], ...action.payload.newDimensions };

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

    case DELETE_BOX_LABELS:
      boxLabels = boxes[action.payload.index].labels || [];

      action.payload.labels.forEach(label => {
        labelIndex = boxLabels.indexOf(label);

        if (labelIndex > -1) {
          boxLabels.splice(labelIndex, 1);
        }
      });

      boxes[action.payload.index].labels = boxLabels;

      return { ...state, boxes };

    default: return state;
  }
}
