import licensesReducer from './licenses.js';
import cesReducer from './ces.js';
import accountDataReducer from './accountData.js';

import { combineReducers } from 'redux';

const allReducer = combineReducers({
    licenses: licensesReducer,
    ces: cesReducer,
    accountData: accountDataReducer,
})

export default allReducer;