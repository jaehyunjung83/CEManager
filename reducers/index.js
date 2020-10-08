import licensesReducer from './licenses.js';
import cesReducer from './ces.js';

import { combineReducers } from 'redux';

const allReducer = combineReducers({
    licenses: licensesReducer,
    ces: cesReducer,
})

export default allReducer;