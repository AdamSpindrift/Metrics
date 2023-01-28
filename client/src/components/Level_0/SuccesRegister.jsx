import React, { useEffect, useState } from "react";
import axios from "axios";
import { navigate } from "hookrouter";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../actions/login";
import { invalidPassword } from "../actions/invalidPassword";
import { validPassword } from "../actions/validPassword";
import { setUserName } from "../actions/setusername";
import { setCompany } from "../actions/setcompany";
import { setEmployees } from "../actions/setemployees";
import { setTodayStamps } from "../actions/setTodayStamps";
import { setActiveTime } from "../actions/setActiveTime";
import { setClients } from "../actions/setClients";
import { setUserAccess } from "../actions/setUserAccess";
import { setJobs } from "../actions/setjobs";
import { setAllTimestamps } from "../actions/setAllTimestamps";
import { setCompanySettingsComplete } from "../actions/setCompanySettingsComplete";
import { dayComplete } from "../actions/dayComplete";
import { setPressedGo } from "../actions/setPressedGo";
import { setLogo } from "../actions/setLogo";
import store from "../store";
// Custom Modules
import WelcomeMessage from "../Generic/WelcomeMessage";
import Loading from "../Generic/Loading";
require("dotenv").config()

function Login() {
  var isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

    const [user, setUser] = useState({
      email: "",
      password: "",
    });

    const [loading, setLoading] = useState(false);
  
    function handleChange(event) {
      const{name, value} = event.target;
  
      setUser((prevValue) => {
  
        return {
          ...prevValue,
          [name]:value
        };
      })
    };
  
    function handleSubmit (event) {
      event.preventDefault();
    
      setLoading(true);
    
    

      axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/login", {user})
        .then(res => {
          console.log(res.data.message);
          const userData = res.data.user;
          const employees = res.data.employees;
          const jobs = res.data.jobs;
          const timeStamps = res.data.allStamps;

        if(userData.auth === true){
          store.dispatch(setLogo(res.data.logo));
          store.dispatch(setUserName(userData.fName + " " + userData.lName));
          store.dispatch(setUserAccess(userData.access));
          store.dispatch(setCompany(userData.company));
          store.dispatch(setActiveTime(userData.activeTime));
          store.dispatch(setAllTimestamps(timeStamps));
          store.dispatch(setEmployees(employees));
          store.dispatch(setJobs(jobs));
          store.dispatch(setTodayStamps(res.data.stamps));
          store.dispatch(setClients(res.data.clients));
          store.dispatch(setCompanySettingsComplete(res.data.settingsComplete));
          store.dispatch(validPassword());
          store.dispatch(login());
          if (userData.dayComplete === true) {
            store.dispatch(dayComplete());
          };
          if (userData.activeTime !== null) {
            store.dispatch(setPressedGo());
          };
          setLoading(false);
          navigate("/dashboard");
        } else {
          store.dispatch (invalidPassword());
          setLoading(false);
          navigate("/login");
        }
      });
      };
  
  return (
    <div className="container">
      <img className="login-logo" src="../images/Metrics_Logo.png" alt="Metrics Logo"></img>
      <h1 className="login__primary-heading">Metrics</h1>
      <h2 className="login__welcome-message">Registration Successful Please Login</h2>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} type="text" value={user.email} name="email" placeholder="Email" required/>
        <input onChange={handleChange} type="password" value={user.password} name="password" placeholder="Password" required/>
        <button className="main-button main-button--large" type="submit">Login</button>
      </form>

      {loading === true ? <Loading /> : <div>&nbsp;</div>}
    </div>
  );
};

export default Login;