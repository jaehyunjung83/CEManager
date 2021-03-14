const certificationsReducer = (state = {}, action) => {
    switch(action.type){
        case 'UPDATE_CERTIFICATIONS':
            state = action.payload;
            return state;
        default:
            return state;
    }
}

export default certificationsReducer;