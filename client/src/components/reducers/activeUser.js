const activeUserReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_USER":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeUserReducer;