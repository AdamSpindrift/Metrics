const timerGoReducer = (state = false, action) => {
    switch(action.type){
        case "TIMER_GO":
            return state = true;

        case "TIMER_STOP":
            return state = false;

        default: 
            return state;
    }
};

export default timerGoReducer;