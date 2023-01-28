const fNameReducer = (state = "", action) => {
    switch(action.type){
        case "EMPLOYEE_FNAME":
            return state = action.payload;

        default: 
            return state;
    }
};

export default fNameReducer;