const userAccessReducer = (state = "", action) => {
    switch(action.type){
        case "USER_ACCESS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default userAccessReducer;