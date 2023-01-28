export const setReduxStartTime = (time) => {
    return {
        type: "TIMER_START_TIME",
        payload: time
    };
};

