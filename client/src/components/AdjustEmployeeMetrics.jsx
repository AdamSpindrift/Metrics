import React, {useState} from "react";
import axios from "axios";
import {navigate} from "hookrouter";
import {useSelector, useDispatch} from "react-redux";
import {login} from "./actions/login";
import {setUserName} from "./actions/setusername";
import {setCompany} from "./actions/setcompany";
import {setEmployees} from "./actions/setemployees";
import {setFName} from "./actions/setemployeefname";
import {setLName} from "./actions/setemployeelname";
import store from "./store";


function AdjustEmployeeMetrics() {
  
  const userName = useSelector(state => state.userName);
  const company = useSelector(state => state.company);
  let employees = useSelector(state => state.employees);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const fName = useSelector(state => state.fName);
  const dispatch = useDispatch();

  const navDashboard = () => {
    store.dispatch (setUserName(userName));
    store.dispatch (setCompany(company));
    store.dispatch (setEmployees(employees));
    store.dispatch(login());
    navigate("/dashboard")
  };

  const navEditEmployeeMetrics =() => {
    store.dispatch (setUserName(userName));
    store.dispatch (setCompany(company));
    store.dispatch (setEmployees(employees));
    store.dispatch(login());
    navigate("/editemployeemetrics")
  };

  
  const filterEmployee = employees.filter(employee => employee.fName === fName);
  const currentEmployee = filterEmployee[0];


  const [target, setTarget] = useState({
    employeefName: currentEmployee.fName,
    employeelName: currentEmployee.lName,
    company: company,
    addVAT: 0,
    addPAYE: 0,
    addBookkeeping: 0,
    addPersonalTax: 0,
    addAccountsProduction: 0,
  });



  function handleChange(event) {
    const{name, value} = event.target;

    setTarget((prevValue) => {

      return {
        ...prevValue,
        [name]:parseInt(value)
      };
    })
  };



  const handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/adjustmetrics", {target})
      .then(res => {
        console.log(res);
        console.log(res.data);
        const newEmployees = res.data.employees;

        store.dispatch (setUserName(userName));
        store.dispatch (setCompany(company));
        store.dispatch (setEmployees(newEmployees));
        store.dispatch (login());
        navigate('/editemployeemetrics');

      });
  };

  

  if( isLoggedIn === true) {
  
    return (
      <div className="container-2">

        
          <img className="company-logo" src="../images/DJCA_Logo_Alpha_1280x720.png" alt="djca Logo"></img>
          <h1>{fName} Metrics Adjustment</h1>
          

          <div className="metricsNav">

            <form onSubmit={navEditEmployeeMetrics}>
              <button className="main-button main-button--large" type ="submit">Edit Employee Metrics</button>
            </form>

            <form onSubmit={navDashboard}>
              <button className="main-button main-button--large" type="submit" name="submit">Dashboard</button>
            </form>

          </div>

          <form onSubmit={handleSubmit}>
            <label for="VATTarget">Adjust VAT</label>
            <input onChange={handleChange} type="number" value={target.addVAT} name="addVAT" placeholder="add VAT " required/>

            <label for="PAYETarget">Adjust PAYE</label>
            <input onChange={handleChange} type="number" value={target.addPAYE} name="addPAYE" placeholder="add PAYE " required/>

            <label for="BookeepingTarget">Adjust Bookkeeping</label>
            <input onChange={handleChange} type="number" value={target.addBookkeeping} name="addBookkeeping" placeholder="add Bookkeeping " required/>

            <label for="PersonalTaxTarget">Adjust Personal Tax</label>
            <input onChange={handleChange} type="number" value={target.addPersonalTax} name="addPersonalTax" placeholder="add Personal Tax " required/>

            <label for="AccountsProductionTarget">Adjust Accounts Production</label>
            <input onChange={handleChange} type="number" value={target.addAccountsProduction} name="addAccountsProduction" placeholder="add Accounts Production " required/>

            <button className="main-button main-button--large" type="submit" name="submit">Submit</button>
          </form>
      
      </div>
    )
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

export default AdjustEmployeeMetrics;
