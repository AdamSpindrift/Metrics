const jobsReducer = (state = "", action) => {
    switch(action.type){
        case "JOBS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default jobsReducer;