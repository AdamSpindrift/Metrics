const employeesReducer = (state = "", action) => {
    switch(action.type){
        case "EMPLOYEES":
            return state = action.payload;

        default: 
            return state;
    }
};

export default employeesReducer;