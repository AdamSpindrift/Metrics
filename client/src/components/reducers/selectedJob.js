const selectedJobReducer = (state = null, action) => {
    switch(action.type){
        case "SELECTED_JOB":
            return state = action.payload;

        default: 
            return state;
    }
};

export default selectedJobReducer;