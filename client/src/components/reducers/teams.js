const teamsReducer = (state = [], action) => {
    switch(action.type){
        case "TEAMS":
            return state = action.payload;

        default: 
            return state;
    }
};

export default teamsReducer;