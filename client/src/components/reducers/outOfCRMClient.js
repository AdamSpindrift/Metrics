const outOfCRMClientReducer = (state = null, action) => {
    switch(action.type){
        case "OUT_OF_CRM_CLIENT":
            return state = action.payload;

        default: 
            return state;
    }
};

export default outOfCRMClientReducer;