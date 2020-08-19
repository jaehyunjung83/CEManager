const licensesReducer = (state = {}, action) => {
    switch(action.type){
        case 'UPDATE_LICENSES':
            state = action.payload;
            return state;
        default:
            return state;
    }
}

export default licensesReducer;