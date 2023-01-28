import React, { useState } from "react";
import axios from "axios";
import {navigate} from "hookrouter";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
require("dotenv").config()


function EditUser() {

  const company = useSelector(state => state.company);
  const activeUserID = useSelector(state => state.activeUser);
  const users = useSelector(state => state.users);
  const dispatch = useDispatch();

  const currentUser = users.find(user => user._id === activeUserID);

  const [contact, setContact] = useState({
    fName: currentUser.FirstName,
    lName: currentUser.LastName,
    company: company,
    email: currentUser.Email,
    access: currentUser.Access,
    costPerHour: currentUser.CostPerHour,
    dayComplete: currentUser.DayComplete,
    id: currentUser._id,
    password:"",
    jobTitle: currentUser.JobTitle,
    hoursDay: currentUser.WorkingHoursDay,
    daysWeek: currentUser.WorkingDaysWeek,
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

    axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/updateuser", {contact})
      .then(res => {
        
      });

    
    navigate('/users');
      
    };


    function handlePassword (event) {
      event.preventDefault();
  
      axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/resetpassword", {contact})
        .then(res => {
          
        });
  
      
      navigate('/users');
        
      };




    const navSettings =() => {
      
      navigate("/settings")
    };
  
    

  return (
    <div className="container-2">
      <Header title="Edit User"/>

      <form onSubmit={navSettings}>
        <button className="main-button main-button--large button-top-left" type ="submit">Settings</button>
      </form>
      
      <br></br>

      <div className="row">

        <div className="col-1-of-2">

          <form onSubmit={handleSubmit}>
            <h4 className="form__input-label">First Name</h4>
            <input onChange={handleChange} type="text" value={contact.fName} name="fName" placeholder="First Name" required/>

            <h4 className="form__input-label">Last Name</h4>
            <input onChange={handleChange} type="text" value={contact.lName} name="lName" placeholder="Last Name" required/>

            <h4 className="form__input-label">Access Rights</h4>
            <select onChange={handleChange} type="text" value={contact.access} className="selector" id="access" name="access" required>
              <label for="access">User Type</label>
                <option>Default</option>
                <option>Admin</option>
                <option>User</option>
            </select>

            <h4 className="form__input-label">Job Title</h4>
            <select onChange={handleChange} type="text" value={contact.jobTitle} className="selector" id="jobTitle" name="jobTitle" required>
              <label for="access">Job Title</label>
                <option>Default</option>
                <option>Director</option>
                <option>Team Lead</option>
                <option>Team Member</option>
                <option>Sales Team</option>
                <option>Admin Team</option>
            </select>

            <h4 className="form__input-label">Hourly Cost</h4>
            <input onChange={handleChange} type="number" value={contact.costPerHour} name="costPerHour" placeholder="Cost Per Hour" required/>

            <button className="main-button main-button--large" type="submit">Submit</button>
          </form>

        </div>

        <div className="col-1-of-2">

          <form onSubmit={handlePassword}>
            <h4 className="form__input-label">Reset Password</h4>
            <input onChange={handleChange} type="password" value={contact.password} name="password" placeholder="password" required/>
            
            <button className="main-button main-button--large" type="submit">Submit</button>
          </form>

        </div>
      </div>
      

      
    </div>
  );
};

export default EditUser;
