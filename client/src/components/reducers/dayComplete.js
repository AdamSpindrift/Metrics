const dayCompleteReducer = (state = false, action) => {
    switch(action.type){
        case "DAY_COMPLETE":
            return state = true;

        case "DAY_NOT_COMPLETE":
            return state = false;

        default: 
            return state;
    }
};

export default dayCompleteReducer;