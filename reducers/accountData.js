const accountDataReducer = (state = {}, action) => {
    switch(action.type){
        case 'UPDATE_ACCOUNT_DATA':
            state = action.payload;
            return state;
        default:
            return state;
    }
}

export default accountDataReducer;