const kpiTemplatesReducer = (state = "", action) => {
    switch(action.type){
        case "KPITEMPLATES":
            return state = action.payload;

        default: 
            return state;
    }
};

export default kpiTemplatesReducer;