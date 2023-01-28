import React, { useState, Fragment, useEffect } from "react";

// Custom Modules
import WelcomeMessage from "../Generic/WelcomeMessage";
import Nav from "../Generic/Nav";
require("dotenv").config()

function EmployeeDetails () {

    return (
        <div>
            <WelcomeMessage />
            <Nav />
            <h1>Employee Details</h1>
        </div>
    );
};


export default EmployeeDetails;