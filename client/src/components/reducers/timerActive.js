const timerActiveReducer = (state = false, action) => {
    switch(action.type){
        case "TIMER_ACTIVE":
            return state = true;

        case "TIMER_OFF":
            return state = false;

        default: 
            return state;
    }
};

export default timerActiveReducer;