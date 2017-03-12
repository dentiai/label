import {
  LOAD_BOXES,
  DRAW_NEW_BOX,
  ADD_NEW_BOX,
  UPDATE_BOX,
  DELETE_BOX,
  UPDATE_BOX_LABELS,
} from '../actions';

const INIT_STATE = {
  boxes: [],
  newBox: null,
}

export default (state = INIT_STATE, action) => {
  let { boxes, editingBoxIndex } = state;

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

    case UPDATE_BOX_LABELS:
      boxes[action.payload.index].labels = action.payload.labels;

      return { ...state, boxes };

    default: return state;
  }
}
