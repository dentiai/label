import { LOAD_LABEL_CONFIG } from '../actions';

const INIT_STATE = {
  config: null,
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOAD_LABEL_CONFIG:
      return { ...state, config: action.payload };

    default: return state;
  }
}
