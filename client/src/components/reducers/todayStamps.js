const todayStampsReducer = (state = "", action) => {
    switch(action.type){
        case "TODAY_STAMPS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default todayStampsReducer;