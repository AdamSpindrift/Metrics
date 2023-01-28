const logoReducer = (state = "", action) => {
    switch(action.type){
        case "LOGO":
            return state = action.payload;

        default: 
            return state;
    }
};

export default logoReducer;