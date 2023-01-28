import React from "react";
import axios from "axios";
require("dotenv").config()


const getEmployees = ((company) => {
    
    console.log(company);
     
    const requestData = {company: company};

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/allmetrics", {requestData})
        .then(res => {
                console.log(res.data.message);
                const employees1 = res.data.employees;
                console.log(employees1);

            return (
            employees1
            );
        });
});


export default getEmployees;