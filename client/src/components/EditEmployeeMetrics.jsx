import React, { useState} from "react";
import {navigate} from "hookrouter";
import {useSelector, useDispatch} from "react-redux";
import {login} from "./actions/login";
import {setUserName} from "./actions/setusername";
import {setCompany} from "./actions/setcompany";
import {setEmployees} from "./actions/setemployees";
import {setFName} from "./actions/setemployeefname";
import {setLName} from "./actions/setemployeelname";
import store from "./store";


function EditEmployeeMetrics() {
  
  const userName = useSelector(state => state.userName);
  const company = useSelector(state => state.company);
  let employees = useSelector(state => state.employees);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();


  const [employee1, setEmployee] = useState({
    name: "",
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
  

  const navDashboard = () => {
    store.dispatch (setUserName(userName));
    store.dispatch (setCompany(company));
    store.dispatch (setEmployees(employees));
    store.dispatch(login());
    navigate("/dashboard")
  };



  const tableData = () => {
    return employees.map((employee, index) => {
      const {fName, lName,
        AddVATReturn,
        AddPAYE,
        AddBookkeeping,
        AddPersonalTaxReturn,
        AddAccountsProduction,
      } = employee;
      
      let rowClass = "";
      if (index % 2 === 0){
        rowClass= "evenRow";
      } else {
        rowClass= "oddRow";
      };

      

      return (
        <tr key={index} className={rowClass}>
          <td>{fName}</td>
          <td>{lName}</td>
          <td>{AddVATReturn}</td>
          <td>{AddPAYE}</td>
          <td>{AddBookkeeping}</td>
          <td>{AddPersonalTaxReturn}</td>
          <td>{AddAccountsProduction}</td>
        </tr>
      )
    });
  };

  const employeeSelector = () => {
    return employees.map((employee, index) => {
      const {fName, lName,
      } = employee;

      return (
        <option>{fName} {lName}</option>
      )
    })
  };


  const editMe = (event) => {
    event.preventDefault();

    const splitArray = employee1.name.split(" ", 2); 
    
      
      store.dispatch(setFName(splitArray[0]));
      store.dispatch(setLName(splitArray[1]));
      store.dispatch(setUserName(userName));
      store.dispatch(setCompany(company));
      store.dispatch(setEmployees(employees));
      store.dispatch(login());
      navigate('/adjustmetric');
   
    
  };


  
  if( isLoggedIn === true) {
  
    return (
      <div className="container-2">

        
          <img className="company-logo" src="../images/DJCA_Logo_Alpha_1280x720.png" alt="djca Logo"></img>
          <h1>Metrics Adjustment</h1>
          

          <div className="metricsNav">

            <form onSubmit={navDashboard}>
              <button className="home-button" type="submit" name="submit">Dashboard</button>
            </form>
          </div>
        
      

        <div className="container-2">
          <table id="employeetable" className="employeeTable">
            <tbody>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>VAT Adjust</th>
                <th>PAYE Adjust</th>
                <th>Bookeeping Adjust</th>
                <th>Personal Tax Return Adjust</th>
                <th>Accounts Production Adjust</th>
              </tr>
              {tableData()}
            </tbody>  
          </table>
          <br></br>
          <h3>Please select Employee to edit</h3>
          <br></br>
          <form onSubmit={editMe}>
            <select onChange={handleChange} type="text" value={employee1.name} className="selector" id="name" name="name" required>
              <label for="nameSelection">Employee Name</label>
                <option>Employee Name</option>
                {employeeSelector()}
            </select>
          <button className="main-button main-button--large" type ="submit">Edit</button>
          </form>
        </div>
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

export default EditEmployeeMetrics;
