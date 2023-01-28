const userNameReducer = (state = "", action) => {
    switch(action.type){
        case "USER_NAME":
            return state = action.payload;

        default: 
            return state;
    }
};

export default userNameReducer;