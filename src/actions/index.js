export const LOAD_BOXES               = 'LOAD_BOXES';
export const DRAW_NEW_BOX             = 'DRAW_NEW_BOX';
export const ADD_NEW_BOX              = 'ADD_NEW_BOX';
export const UPDATE_BOX               = 'UPDATE_BOX';
export const DELETE_BOX               = 'DELETE_BOX';

export const LOAD_LABEL_CONFIG        = 'LOAD_LABEL_CONFIG';
export const ADD_BOX_LABEL            = 'ADD_BOX_LABEL';
export const DELETE_BOX_LABEL         = 'DELETE_BOX_LABEL';
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

export const addLabelForBoxAtIndex = (index, label) => {
  return (dispatch, getState) => {
    const state = getState();

    let isLabelValid = false;

    // check label mutual exclusivity
    let owningGroup = null;

    state.labels.config.groups.forEach(group => {
      if (group.labels.indexOf(label) > -1) {
        owningGroup = group;
      }
    });

    // if the label's group is a mutually exclusive group and the label
    // already exist on the image, then the label is invalid
    if (owningGroup.areLabelsMutuallyExclusive) {
      let doesLabelExistOnImage = false;

      for (let i = 0; i < state.image.boxes.length; i++) {
        let boxLabels = state.image.boxes[i].labels || [];

        for (let j = 0; j < boxLabels.length; j++) {
          if (label === boxLabels[j]) {
            doesLabelExistOnImage = true;
            break;
          }
        }
      }

      isLabelValid = !doesLabelExistOnImage;

    } else {
      isLabelValid = true;
    }

    if (isLabelValid) {
      // there can only be one member of a mutually exlusive group's labels
      // associated with any given box. so we delete all other group members
      // from this box before we add the new label.
      if (owningGroup !== null) {
        owningGroup.labels.forEach(groupMember => {
          dispatch({
            type: DELETE_BOX_LABEL,
            payload: { index, label: groupMember },
          });
        });
      }

      dispatch({
        type: ADD_BOX_LABEL,
        payload: { index, label }
      });
    }
  };
};

export const deleteLabelForBoxAtIndex = (index, label) => ({
  type: DELETE_BOX,
  payload: { index, label },
});

export const toggleLabelForBoxAtIndex = (index, label) => ({
  type: TOGGLE_BOX_LABEL,
  payload: { index, label },
});
