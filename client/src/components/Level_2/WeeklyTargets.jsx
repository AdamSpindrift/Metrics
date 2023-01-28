import React, { useState} from "react";
import {navigate} from "hookrouter";
import {useSelector, useDispatch} from "react-redux";
import {login} from "../actions/login";
import {setUserName} from "../actions/setusername";
import {setCompany} from "../actions/setcompany";
import {setEmployees} from "../actions/setemployees";
import {setFName} from "../actions/setemployeefname";
import {setLName} from "../actions/setemployeelname";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import SettingsNav from "../Generic/SettingsNav";


function WeeklyTargets() {
  
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

  const navQuarterlyTargets = () => {
    store.dispatch (setUserName(userName));
    store.dispatch (setCompany(company));
    store.dispatch (setEmployees(employees));
    store.dispatch(login());
    navigate("/quarterlytargets")
  };



  const tableData = () => {
    return employees.map((employee, index) => {
      const {fName, lName,
        WTargetVATReturn,
        WTargetPAYE,
        WTargetBookkeeping,
        WTargetPersonalTaxReturn,
        WTargetAccountsProduction,
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
          <td>{WTargetVATReturn}</td>
          <td>{WTargetPAYE}</td>
          <td>{WTargetBookkeeping}</td>
          <td>{WTargetPersonalTaxReturn}</td>
          <td>{WTargetAccountsProduction}</td>
        </tr>
      )
    })
  };

  const employeeSelector = () => {
    return employees.map((employee, index) => {
      const {fName, lName,
        WTargetVATReturn,
        WTargetPAYE,
        WTargetBookkeeping,
        WTargetPersonalTaxReturn,
        WTargetAccountsProduction,
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
      navigate('/editweeklytarget');
   
    
  };


  
  if( isLoggedIn === true) {
  
    return (
      <div className="container-2">

        
          <Header title="Weekly Targets" />
          <SettingsNav />
          

          <div className="metricsNav">

            <form onSubmit={navQuarterlyTargets}>
              <button className="home-button" type ="submit">Quarterly Targets</button>
            </form>

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
                <th>VAT Target</th>
                <th>PAYE Target</th>
                <th>Bookeeping Target</th>
                <th>Personal Tax Return Target</th>
                <th>Accounts Production Target</th>
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
        <PleaseLogin />
      )
    };

  };

export default WeeklyTargets;
