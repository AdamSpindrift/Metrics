import React from "react";

function PleaseLogin () {
    return (
        <div className="container full-height login">
          <img className="login-logo" src="../images/Metrics_Logo.png" alt="Metrics Logo"></img>
          <h1 className="login__primary-heading">Metrics</h1>
          <h3>Please Login</h3>

          <a href="/login">
            <button className="main-button main-button--large" type ="submit">Login</button>
          </a>
        </div>
      )
};

export default PleaseLogin;