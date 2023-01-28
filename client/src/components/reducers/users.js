const usersReducer = (state = null, action) => {
    switch(action.type){
        case "USERS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default usersReducer;