import React, { useState } from "react";
import axios from "axios";
import {navigate} from "hookrouter";
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import {setEmployees} from "../actions/setemployees";
require("dotenv").config()


function AddEmployee() {

  const company = useSelector(state => state.company);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

  const [employee, setEmployee] = useState({
    company: company,
    fName: "",
    lName: "",
    position: "",
  });


  function handleChange(event) {
    const{name, value} = event.target;

    setEmployee((prevValue) => {

      return {
        ...prevValue,
        [name]:value
      };
    })
  };

  function handleSubmit (event) {
    event.preventDefault();
    

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/newemployee", {employee})
      .then(res => {
        console.log(res.data.message);
        const employees1 = res.data.employees;
        
        store.dispatch (setEmployees(employees1));
        navigate('/settings');
        return;  
      });
    };

    const navSettings =() => {
      
      navigate("/settings")
    };

  
  if( isLoggedIn === true) {
  return (
    <div className="container">
      <img className="company-logo" src="../images/DJCA_Logo_Alpha_1280x720.png" alt="djca Logo"></img>
      <h1>Add Employee</h1>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} type="hidden" value={company} name="company" placeholder="Company" required/>
        <input onChange={handleChange} type="text" value={employee.fName} name="fName" placeholder="First Name" required/>
        <input onChange={handleChange} type="text" value={employee.lName} name="lName" placeholder="Last Name" required/>
        <input onChange={handleChange} type="text" value={employee.position} name="position" placeholder="Position" required/>
        <button className="main-button main-button--large" type="submit">Submit</button>
      </form>

      <form onSubmit={navSettings}>
      <button className="main-button main-button--large" type ="submit">Settings</button>
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

export default AddEmployee;
