import React, { useState } from "react";
import axios from "axios";
import {navigate} from "hookrouter";
// State
import {useSelector} from "react-redux";
import store from "../store";
// Custom Modules
import Nav from "../Generic/Nav";
import Loading from "../Generic/Loading";
require("dotenv").config()


function AddUser() {

  const company = useSelector(state => state.company);
  let isLoggedIn = useSelector(state => state.loggedIn);

  const [contact, setContact] = useState({
    fName: "",
    lName: "",
    company: company,
    email: "",
    password: "",
    cpassword: "",
    access: "",
    costPerHour: 0,
    daysWeek: 0,
    hoursDay: 0,
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

  const [loading, setLoading] = useState(false);


  function handleSubmit (event) {
    event.preventDefault();
    setLoading(true);

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/newuser", {contact})
      .then(res => {
        console.log(res);
        console.log(res.data);
        setLoading(false);
      });

    
    navigate('/settings');
      
    };

    const navSettings =() => {
      
      navigate("/settings")
    };
  
    

  return (
    <div className="container-2">
      <h1>Add User</h1>
      <Nav />
      
      <form onSubmit={handleSubmit}>
        <h4>First Name</h4>
        <input onChange={handleChange} type="text" value={contact.fName} name="fName" placeholder="First Name" required/>
        <h4>Last Name</h4>
        <input onChange={handleChange} type="text" value={contact.lName} name="lName" placeholder="Last Name" required/>
        <h4>Company</h4>
        <input onChange={handleChange} type="text" value={contact.company} name="company" placeholder="Company" required readOnly/>
        <h4>Access Privileges</h4>
        <select onChange={handleChange} type="text" value={contact.access} className="selector" id="access" name="access" required>
            <option>Select Access</option>
            <option>Admin</option>
            <option>User</option>
            <option>User NoMeeting NoAdmin NoQQ</option>
        </select>
        <h4>Working Days in Week</h4>
        <input onChange={handleChange} type="number" value={contact.daysWeek} name="daysWeek" required/>
        <h4>Working Hours in Day</h4>
        <input onChange={handleChange} type="number" value={contact.hoursDay} name="hoursDay" required/>
        <h4>Email</h4>
        <input onChange={handleChange} type="email" value={contact.email} name="email" placeholder="Email" required/>
        {contact.password !== contact.cpassword ? <h3 className="error-text">Passwords Do Not Match</h3> : <h3></h3>}
        <h4>Password</h4>
        <input onChange={handleChange} type="password" value={contact.password} name="password" placeholder="Password" required/>
        <h4>Confirm Password</h4>
        <input onChange={handleChange} type="password" value={contact.cpassword} name="cpassword" placeholder="Confirm Password" required/>
        <button className="main-button main-button--large" type="submit">Submit</button>
      </form>

      <form onSubmit={navSettings}>
      <button className="main-button main-button--large" type ="submit">Settings</button>
      </form>
    </div>
  );
};

export default AddUser;
