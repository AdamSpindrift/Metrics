const timeDescriptionReducer = (state = "", action) => {
    switch(action.type){
        case "TIME_DESCRIPTION":
            return state = action.payload;

        default: 
            return state;
    }
};

export default timeDescriptionReducer;