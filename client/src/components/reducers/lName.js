const lNameReducer = (state = "", action) => {
    switch(action.type){
        case "EMPLOYEE_LNAME":
            return state = action.payload;

        default: 
            return state;
    }
};

export default lNameReducer;