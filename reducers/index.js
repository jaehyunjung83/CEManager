import licensesReducer from './licenses.js';
import cesReducer from './ces.js';
import accountDataReducer from './accountData.js';
import certificationsReducer from './certifications.js';

import { combineReducers } from 'redux';

const allReducer = combineReducers({
    licenses: licensesReducer,
    ces: cesReducer,
    accountData: accountDataReducer,
    certifications: certificationsReducer,
})

export default allReducer;