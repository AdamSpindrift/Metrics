const transactionsReducer = (state = null, action) => {
    switch(action.type){
        case "TRANSACTIONS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default transactionsReducer;