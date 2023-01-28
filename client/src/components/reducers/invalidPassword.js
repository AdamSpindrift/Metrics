const passwordReducer = (state = false, action) => {
    switch(action.type){
        case "INVALID_PASSWORD":
            return state = true;

        case "VALID_PASSWORD":
            return state = false;

        default: 
            return state;
    }
};

export default passwordReducer;