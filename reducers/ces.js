const cesReducer = (state = {}, action) => {
    switch(action.type){
        case 'UPDATE_CES':
            state = action.payload;
            return state;
        default:
            return state;
    }
}

export default cesReducer;