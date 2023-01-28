const currentStampReducer = (state = null, action) => {
    switch(action.type){
        case "CURRENT_STAMP":
            return state = action.payload;

        default: 
            return state;
    }
};

export default currentStampReducer;