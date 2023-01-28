const pressedGoReducer = (state = false, action) => {
    switch(action.type){
        case "PRESSED_GO":
            return state = true;

        case "PRESSED_STOP":
            return state = false;

        default: 
            return state;
    }
};

export default pressedGoReducer;