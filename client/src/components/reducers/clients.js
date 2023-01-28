const clientsReducer = (state = null, action) => {
    switch(action.type){
        case "CLIENTS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default clientsReducer;