const activeEmployeeReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_EMPLOYEE":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeEmployeeReducer;