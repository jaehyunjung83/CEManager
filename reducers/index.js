import licensesReducer from './licenses.js';
import { combineReducers } from 'redux';

const allReducer = combineReducers({
    licenses: licensesReducer,
})

export default allReducer;