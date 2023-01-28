import React from "react";

function Loading () {

    return (
        <div className="loading">
            <h1 className="loading__primary-heading">Metrics</h1>
            <h3 className="loading__message">Please wait...</h3>
            <img className="loading__spinner" src="../images/Metrics_Spinner_v1.png" alt="Loading"></img>
        </div>
    )
      
};

export default Loading;