import React, { useEffect, useState } from "react";
import axios from "axios";
import { navigate } from "hookrouter";
// State
import { useSelector, useDispatch } from "react-redux";
import { login } from "../actions/login";
import { setUserName } from "../actions/setusername";
import { setCompany } from "../actions/setcompany";
import { setEmployees } from "../actions/setemployees";
import { logout } from "../actions/logout";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
require("dotenv").config()


function AddUser() {

  const userName = useSelector(state => state.userName);
  const nameArray = userName.split(" ", 2);
  const company = useSelector(state => state.company);
  let employees = useSelector(state => state.employees);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

  const [contact, setContact] = useState({
    fName: nameArray[0],
    lName: nameArray[1],
    company: company,
    password: "",
    cpassword: "",
  });

  function handleChange(event) {
    const{name, value} = event.target;

    setContact((prevValue) => {

      return {
        ...prevValue,
        [name]:value
      };
    })
  };

  function handleSubmit (event) {
    event.preventDefault();

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/resetpassword", {contact})
      .then(res => {
        console.log("Password Updated");
        store.dispatch(logout());
      });

    navigate("/login");
      
  };

    const navSettings =() => {
      
      navigate("/settings")
    };
  
    
    if(isLoggedIn === true) {
      return (
        <div className="container-2">
          <Header title="Password Reset"/>
          
          <form onSubmit={handleSubmit}>
            {contact.password !== contact.cpassword ? <h3 className="error-text">Passwords Do Not Match</h3>: <div>&nbsp;</div>}
            <input onChange={handleChange} type="hidden" value={contact.fName} name="fName" placeholder="First Name" required/>
            <input onChange={handleChange} type="hidden" value={contact.lName} name="lName" placeholder="Last Name" required/>
            <input onChange={handleChange} type="hidden" value={contact.company} name="company" placeholder="Company" required/>
            <input onChange={handleChange} type="password" value={contact.password} name="password" placeholder="Password" required/>
            <input onChange={handleChange} type="password" value={contact.cpassword} name="cpassword" placeholder="Confirm Password" required/>
            {contact.password === contact.cpassword ? <button className="main-button main-button--large" type="submit">Submit</button> : <div>&nbsp;</div>}
          </form>
    
          <form onSubmit={navSettings}>
          <button className="main-button main-button--large" type ="submit">Settings</button>
          </form>
        </div>
      );
    } else {
      return ( <PleaseLogin />);
    };
  
};

export default AddUser;
