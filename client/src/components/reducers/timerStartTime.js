const timerStartTimeReducer = (state = "", action) => {
    switch(action.type){
        case "TIMER_START_TIME":
            return state = action.payload;

        default: 
            return state;
    }
};

export default timerStartTimeReducer;