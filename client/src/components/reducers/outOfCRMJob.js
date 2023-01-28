const outOfCRMReducer = (state = null, action) => {
    switch(action.type){
        case "OUT_OF_CRM_JOB":
            return state = action.payload;

        default: 
            return state;
    }
};

export default outOfCRMReducer;