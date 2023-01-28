const stampsEndReducer = (state = null, action) => {
    switch(action.type){
        case "STAMPS_END":
            return state = action.payload;

        default: 
            return state;
    }
};

export default stampsEndReducer;