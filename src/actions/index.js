export const LOAD_BOXES               = 'LOAD_BOXES';
export const DRAW_NEW_BOX             = 'DRAW_NEW_BOX';
export const ADD_NEW_BOX              = 'ADD_NEW_BOX';
export const UPDATE_BOX               = 'UPDATE_BOX';
export const DELETE_BOX               = 'DELETE_BOX';

export const LOAD_LABEL_CONFIG        = 'LOAD_LABEL_CONFIG';
export const TOGGLE_BOX_LABEL         = 'TOGGLE_BOX_LABEL';

export const loadBoxes = (boxes) => ({
  type: LOAD_BOXES,
  payload: boxes,
});

export const drawNewBox = (dimensions) => ({
  type: DRAW_NEW_BOX,
  payload: dimensions,
});

export const addNewBox = () => ({ type: ADD_NEW_BOX });

export const updateBoxAtIndex = (index, newDimensions) => ({
  type: UPDATE_BOX,
  payload: { index, newDimensions },
});

export const deleteBoxAtIndex = (index) => ({
  type: DELETE_BOX,
  payload: index,
});

export const loadLabelConfig = (config) => ({
  type: LOAD_LABEL_CONFIG,
  payload: config,
});

export const toggleLabelForBoxAtIndex = (index, label) => ({
  type: TOGGLE_BOX_LABEL,
  payload: { index, label }
});
