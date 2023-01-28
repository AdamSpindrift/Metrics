import React, { useState } from "react";
import axios from "axios";
import {navigate} from "hookrouter";
import {useSelector, useDispatch} from "react-redux";
import {login} from "./actions/login";
import {setUserName} from "./actions/setusername";
import {setCompany} from "./actions/setcompany";
import {setEmployees} from "./actions/setemployees";
import store from "./store";
require("dotenv").config()


function AddCompany() {
  
  const userName = useSelector(state => state.userName);
  const company = useSelector(state => state.company);
  let employees = useSelector(state => state.employees);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

  const [company1, setCompany1] = useState({
    name: "",
    applicationSelection: "",
  });


  function handleChange(event) {
    const{name, value} = event.target;

    setCompany1((prevValue) => {

      return {
        ...prevValue,
        [name]:value
      };
    })
  };

  function handleSubmit (event) {
    event.preventDefault();

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/newcompany", {company1})
      .then(res => {
        console.log(res);
      });

    store.dispatch (setUserName(userName));
    store.dispatch (setCompany(company));
    store.dispatch (setEmployees(employees));
    store.dispatch (login());
    navigate('/dashboard');
      
    };



    const navDashboard =() => {
      store.dispatch (setUserName(userName));
      store.dispatch (setCompany(company));
      store.dispatch (login());
      navigate("/dashboard")
    };

    
  
  if( isLoggedIn === true) {
  return (
    <div className="container">
      <img className="company-logo" src="../images/DJCA_Logo_Alpha_1280x720.png" alt="djca Logo"></img>
      <h1>Add Company</h1>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} type="text" value={company1.name} name="name" placeholder="Company Name" required/>
        <select onChange={handleChange} type="text" value={company1.application} className="selector" id="applicationSelection" name="applicationSelection" required>
          <label for="gallerySelection">Software Selection</label>
            <option>Default</option>
            <option>Senta</option>
        </select>
        <button className="main-button main-button--large" type="submit">Submit</button>
      </form>

      <form onSubmit={navDashboard}>
      <button className="main-button main-button--large" type ="submit">Dashboard</button>
      </form>
    </div>
  );
  } else {
    return (
      <div className="container">
        <img className="login-logo" src="../images/Metrics_Logo.png" alt="Metrics Logo"></img>
        <h1>Metrics</h1>
        <h2>Please Login</h2>

        <a href="/">
          <button className="main-button main-button--large" type ="submit">Login</button>
        </a>
      </div>
    )
    };
  };

export default AddCompany;
