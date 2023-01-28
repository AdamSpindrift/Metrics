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
import { setReduxStartTime } from "../actions/setTimerStartTime";
import { setClients } from "../actions/setClients";
import { setUserAccess } from "../actions/setUserAccess";
import { setJobs } from "../actions/setjobs";
import { setAllTimestamps } from "../actions/setAllTimestamps";
import { setCompanySettingsComplete } from "../actions/setCompanySettingsComplete";
import { setTransactions } from "../actions/setTransactions";
import { dayComplete } from "../actions/dayComplete";
import { setTimerGo } from "../actions/setTimerGo";
import { setLogo } from "../actions/setLogo";
import { setTeams } from "../actions/setTeams";
import { setUser2 } from "../actions/setUser";
import { setUsers } from "../actions/setUsers";
import store from "../store";
// Custom Modules
import WelcomeMessage from "../Generic/WelcomeMessage";
import Loading from "../Generic/Loading";
require("dotenv").config()

const mapStateToProps = (state) => {
  return {
    number: state.number
  };
}

function Login() {
  var isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

  const invalidPassword1 = useSelector(state => state.invalidPassword);

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

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
        setLoading(false);

        if(userData.auth === true){
          store.dispatch(setLogo(res.data.logo));
          store.dispatch(setUserName(userData.fName + " " + userData.lName));
          store.dispatch(setUserAccess(userData.access));
          store.dispatch(setCompany(userData.company));
          store.dispatch(setActiveTime(userData.activeTime));
          store.dispatch(setReduxStartTime(res.data.startTime));
          store.dispatch(setUser2(userData));
          store.dispatch(setAllTimestamps(timeStamps));
          store.dispatch(setEmployees(employees));
          store.dispatch(setJobs(jobs));
          store.dispatch(setTodayStamps(res.data.stamps));
          store.dispatch(setClients(res.data.clients));
          store.dispatch(setTransactions(res.data.transactions));
          store.dispatch(setCompanySettingsComplete(res.data.settingsComplete));
          store.dispatch(setUsers(res.data.users));
          store.dispatch(setTeams(res.data.teams));
          store.dispatch(validPassword());
          store.dispatch(login());
          if (userData.dayComplete === true) {
            store.dispatch(dayComplete());
          };
          if (userData.activeTime !== null) {
            store.dispatch(setTimerGo());
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
    <div className="container login">
      <img className="login-logo" src="../images/Metrics_Logo.png" alt="Metrics Logo"></img>
      <h1 className="login__primary-heading">Metrics</h1>
      <div className="login__welcome-message margin-bottom-large">
        <WelcomeMessage />
      </div>
      

      {invalidPassword1 === true ? <h3 className="error-text">Invalid Credentials</h3> : <h3></h3>}

      <form className="margin-top-large" onSubmit={handleSubmit}>
        <input className="margin-top-large" onChange={handleChange} type="text" value={user.email} name="email" placeholder="Email" required/>
        <input onChange={handleChange} type="password" value={user.password} name="password" placeholder="Password" required/>
        <button className="main-button main-button--large" type="submit" name="submit">Login</button>
      </form>

      {/* <a href="/register">
      <button className="main-button main-button--large" type ="submit">Register</button>
      </a> */}

      {loading === true ? <Loading /> : <div>&nbsp;</div>}

      
    </div>
  );
};

export default Login;
