const loadingReducer = (state = false, action) => {
    switch(action.type){
        case "LOADING":
            return state = true;

        case "READY":
            return state = false;

        default: 
            return state;
    }
};

export default loadingReducer;