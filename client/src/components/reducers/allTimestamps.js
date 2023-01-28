const allTimestampsReducer = (state = [], action) => {
    switch(action.type){
        case "ALL_TIMESTAMPS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default allTimestampsReducer;