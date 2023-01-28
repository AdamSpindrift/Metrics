const companyReducer = (state = "", action) => {
    switch(action.type){
        case "COMPANY":
            return state = action.payload;

        default: 
            return state;
    }
};

export default companyReducer;