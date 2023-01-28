import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import qs from "query-string";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLoginNoLogo from "../Generic/PleaseLoginNoLogo";
import Loading from "../Generic/Loading";
require("dotenv").config()

function XeroAuth () {

  // Xero API
  const state = process.env.REACT_APP_XERO_STATE;
  const codeValue = new URLSearchParams(location.search).get("code");
  const stateURL = new URLSearchParams(location.search).get("state");
  const currentURL = window.location.href;
  const stateArray = stateURL.split("_");
  const stateValue = stateArray[0];
  const company = stateArray[1];

    const authDetails = {
        name: company,
        code: codeValue,
        state: stateValue,
        url: currentURL,
    };

    const [authComplete, setAuthComplete] = useState(false);

    const [authorisationError, setAuthError] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect (() => {

      if(state === stateValue) {

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "xero/gettoken", {authDetails})
          .then(res => {

            setLoading(false);
            setAuthComplete(true);

          });
        };

      
    },[]);

    

    
    
    function handleChange(event) {
        const{name, value} = event.target;
    
        setCompany((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };


        return (
            <div className="container-2 bg-2">
                <Header title="Xero Connection"/>

                {authorisationError === true ? <h2 className="margin-top-small">Authorisation Error</h2> : <div>&nbsp;</div>}
                
                {authComplete === true ? <h2 className="margin-top-small">Authorisation Success</h2> : <div>&nbsp;</div>}

                <PleaseLoginNoLogo/>
                

                

                            

                {loading === true ? <Loading /> : <div>&nbsp;</div>}
                 
            </div>
        );
};


export default XeroAuth;