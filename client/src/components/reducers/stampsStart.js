const stampsStartReducer = (state = null, action) => {
    switch(action.type){
        case "STAMPS_START":
            return state = action.payload;

        default: 
            return state;
    }
};

export default stampsStartReducer;