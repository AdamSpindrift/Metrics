const activeTimeReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_TIME":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeTimeReducer;