import React, { useState } from "react";
import { navigate } from "hookrouter";
//Custom Modules


function Home() {

    return (
        <div className="home">

            <img className="home__logo" src="../images/Metrics_Logo.png" alt="Metrics Logo"></img>
            <h1 className="home__primary-heading">Metrics</h1>

            <a href="/login">
                <button className="main-button main-button--large home__on-top" type ="submit">Login</button>
            </a>

            

        </div>
    );
};

export default Home;