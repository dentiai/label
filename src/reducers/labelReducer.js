import { LOAD_LABEL_CONFIG, LOAD_ACTIVE_LABELS } from '../actions';

const INIT_STATE = {
  config: null,
  activeLabels: [],
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOAD_LABEL_CONFIG:
      return { ...state, config: action.payload };

    case LOAD_ACTIVE_LABELS:
      return { ...state, activeLabels: action.payload };

    default: return state;
  }
}
