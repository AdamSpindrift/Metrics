const activeClientReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_CLIENT":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeClientReducer;