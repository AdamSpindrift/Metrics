const kpiReducer = (state = "", action) => {
    switch(action.type){
        case "KPIS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default kpiReducer;