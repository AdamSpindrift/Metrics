const kpiRolesReducer = (state = "", action) => {
    switch(action.type){
        case "KPIROLES":
            return state = action.payload;

        default: 
            return state;
    }
};

export default kpiRolesReducer;