const companySettingsCompleteReducer = (state = false, action) => {
    switch(action.type){
        case "SETTINGS_COMPLETE":
            return state = action.payload;

        default: 
            return state;
    }
};

export default companySettingsCompleteReducer;