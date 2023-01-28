const timestampsReducer = (state = null, action) => {
    switch(action.type){
        case "TIMESTAMPS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default timestampsReducer;