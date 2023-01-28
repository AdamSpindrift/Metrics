const activeJobReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_JOB":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeJobReducer;