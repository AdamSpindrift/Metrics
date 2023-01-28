const activeBudgetReducer = (state = null, action) => {
    switch(action.type){
        case "ACTIVE_BUDGET":
            return state = action.payload;

        default: 
            return state;
    }
};

export default activeBudgetReducer;