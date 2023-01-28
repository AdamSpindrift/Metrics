export const setActiveUser = (userID) => {
    return {
        type: "ACTIVE_USER",
        payload: userID
    };
};

