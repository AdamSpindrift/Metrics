import React from "react";

function PleaseLoginNoLogo () {
    return (
        <div className="container full-height login">
      
          <h1 className="no-logo-margin">Metrics</h1>
          <h3>Please Login</h3>

          <a href="/login">
            <button className="main-button main-button--large" type ="submit">Login</button>
          </a>
        </div>
      )
};

export default PleaseLoginNoLogo;