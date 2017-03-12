export const LOAD_BOXES               = 'LOAD_BOXES';
export const DRAW_NEW_BOX             = 'DRAW_NEW_BOX';
export const ADD_NEW_BOX              = 'ADD_NEW_BOX';
export const UPDATE_BOX               = 'UPDATE_BOX';
export const DELETE_BOX               = 'DELETE_BOX';

export const LOAD_LABEL_CONFIG        = 'LOAD_LABEL_CONFIG';
export const UPDATE_BOX_LABELS        = 'UPDATE_BOX_LABELS';
export const LOAD_ACTIVE_LABELS       = 'LOAD_ACTIVE_LABELS';

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

export const updateBoxLabelsAtBoxIndex = (index, labels) => ({
  type: UPDATE_BOX_LABELS,
  payload: { index, labels }
});

export const loadActiveLabels = (activeLabels) => ({
  type: LOAD_ACTIVE_LABELS,
  payload: activeLabels,
});
