import React from "react";
import {navigate} from "hookrouter";
import {startOfWeek, endOfWeek, startOfToday, getDayOfYear} from "date-fns";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import {setEmployees} from "../actions/setemployees";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
require("dotenv").config()


function JobMetrics() {
  
  const userName = useSelector(state => state.userName);
  const company = useSelector(state => state.company);
  let employees = useSelector(state => state.employees);
  let isLoggedIn = useSelector(state => state.loggedIn);
  const dispatch = useDispatch();

  let dataPresent = true;

  if (employees === null || employees === undefined) {
    dataPresent = false;
  };

  // Web Socket Connection
  // const ws = new WebSocket("ws://localhost:9000");
  
  // ws.onopen = function () {
  //   ws.send("Ping");
  // };

  // ws.onmessage = function (e) {
  //   console.log("Recieved Message - " + e.data);
  // };
  let getE = "";

  function getEmployees1() {
    getE = setInterval(() => {
      const requestData = {company: company};
    
      axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/allmetrics", {requestData})
        .then(res => {
                console.log(res.data.message);
                const employees1 = res.data.employees;
                console.log(employees1);
                store.dispatch (setEmployees(employees1));
                return;
        });
        clearInterval(getE);
    }, 250000);
  };

  getEmployees1();

  const navQVat = () => {
    clearInterval(getE);
    navigate("/qvat");
  };

  const navQPaye = () => {
    clearInterval(getE);
    navigate("/qpaye");
  };

  const navQBookkeeping = () => {
    clearInterval(getE);
    navigate("/qbookkeeping");
  };

  const navQPtr = () => {
    clearInterval(getE);
    navigate("/qptr");
  };

  const navQAccProd = () => {
    clearInterval(getE);
    navigate("/qaccprod");
  };

  

  if( isLoggedIn === true && dataPresent === false) { 
    return (
      <div className="container-2">
        <Header title="This Weeks Metrics" hello="true"/>
      </div>
    )
  };

  

  let totalVat = [];
  let totalVatTarget = [];
  let totalPaye = [];
  let totalPayeTarget = [];
  let totalBookeeping = [];
  let totalBookkeepingTarget = [];
  let totalPtr = [];
  let totalPtrTarget = [];
  let totalAccProd = [];
  let totalAccProdTarget = [];

  let totalVatDif = [];
  let totalPayeDif = [];
  let totalBookkeepingDif = [];
  let totalPtrDif = [];
  let totalAccProdDif = [];


  const tableData = () => {
    return employees.map((employee, index) => {
      const {fName, lName,
        VATReturn,
        PAYE,
        Bookkeeping,
        PersonalTaxReturn,
        AccountsProduction,
        WTargetVATReturn,
        WTargetPAYE,
        WTargetBookkeeping,
        WTargetPersonalTaxReturn,
        WTargetAccountsProduction,
      } = employee;

      // Logic for filtering jobs in the current week
      const date = startOfToday();
      const sunday = startOfWeek(date);
      const saturday = endOfWeek(date);

      // subDays(saturday, 1);

      const end = saturday;
      const start = sunday;
      const startDay = getDayOfYear(start);
      const endDay = getDayOfYear(end);

      const dayOfYear = (e) => {
        const reFormat = new Date(e);
        const d = reFormat.getDate();
        const m = reFormat.getMonth();
        const y = reFormat.getFullYear();

        const format = getDayOfYear(new Date(y, m, d));
        return(format);
      };

      const VATDays = VATReturn.map(a => dayOfYear(a));
      const thisWeeksVAT = VATDays.filter(a => a >= startDay && a <= endDay);

      const PAYEDays = PAYE.map(a => dayOfYear(a));
      const thisWeeksPAYE = PAYEDays.filter(a => a >= startDay && a <= endDay);

      const BookkeepingDays = Bookkeeping.map(a => dayOfYear(a));
      const thisWeeksBookkeeping = BookkeepingDays.filter(a => a >= startDay && a <= endDay);

      const PersonalTaxReturnDays = PersonalTaxReturn.map(a => dayOfYear(a));
      const thisWeeksPersonalTaxReturn = PersonalTaxReturnDays.filter(a => a >= startDay && a <= endDay);

      const AccountsProductionDays = AccountsProduction.map(a => dayOfYear(a));
      const thisWeeksAccountsProduction = AccountsProductionDays.filter(a => a >= startDay && a <= endDay);

      let weeklyVAT = thisWeeksVAT.length;
      let weeklyPAYE = thisWeeksPAYE.length;
      let weeklyBookkeeping = thisWeeksBookkeeping.length;
      let weeklyPersonalTaxReturn = thisWeeksPersonalTaxReturn.length;
      let weeklyAccountsProduction = thisWeeksAccountsProduction.length;

      // Push for Totals
      totalVat.push(weeklyVAT);
      totalVatTarget.push(WTargetVATReturn);
      totalPaye.push(weeklyPAYE);
      totalPayeTarget.push(WTargetPAYE);
      totalBookeeping.push(weeklyBookkeeping);
      totalBookkeepingTarget.push(WTargetBookkeeping);
      totalPtr.push(weeklyPersonalTaxReturn);
      totalPtrTarget.push(WTargetPersonalTaxReturn);
      totalAccProd.push(weeklyAccountsProduction);
      totalAccProdTarget.push(WTargetAccountsProduction);

      
      // css classes for rows
      let rowClass = "";
      if (index % 2 === 0){
        rowClass= "evenRow";
      } else {
        rowClass= "oddRow";
      };

      let vatDifference = (weeklyVAT - WTargetVATReturn);
      let payeDifference = (weeklyPAYE - WTargetPAYE);
      let bookDifference = (weeklyBookkeeping - WTargetBookkeeping);
      let ptrDifference = (weeklyPersonalTaxReturn - WTargetPersonalTaxReturn);
      let accProdDifference = (weeklyAccountsProduction - WTargetAccountsProduction);

      totalVatDif.push(vatDifference);
      totalPayeDif.push(payeDifference);
      totalBookkeepingDif.push(bookDifference);
      totalPtrDif.push(ptrDifference);
      totalAccProdDif.push(accProdDifference);


      let wVat = "";
      let wTVat = "";
      let wVatDif = "";
      let wPAYE = "";
      let wTPAYE = "";
      let wPAYEDif = "";
      let wBook = "";
      let wTBook = "";
      let wBookDif = "";
      let wPTR = "";
      let wTPTR = "";
      let wPTRDif = "";
      let wAccProd = "";
      let wTAccProd = "";
      let wAccProdDif = "";
      
      // Style Numbers
      if (weeklyVAT === 0) {wVat = "table-0-value"};
      if (WTargetVATReturn === 0) {wTVat = "table-0-value"};
      if (vatDifference >= 0) {wVatDif = "table-pos-value"};
      if (vatDifference < 0) {wVatDif = "table-neg-value"};

      if (weeklyPAYE === 0) {wPAYE = "table-0-value"};
      if (WTargetPAYE === 0) {wTPAYE = "table-0-value"}; 
      if (payeDifference >= 0) {wPAYEDif = "table-pos-value"};
      if (payeDifference < 0) {wPAYEDif = "table-neg-value"};

      if (weeklyBookkeeping === 0) {wBook = "table-0-value"};
      if (WTargetBookkeeping === 0) {wTBook = "table-0-value"}; 
      if (bookDifference >= 0) {wBookDif = "table-pos-value"};
      if (bookDifference < 0) {wBookDif = "table-neg-value"};

      if (weeklyBookkeeping === 0) {wBook = "table-0-value"};
      if (WTargetBookkeeping === 0) {wTBook = "table-0-value"}; 
      if (bookDifference >= 0) {wBookDif = "table-pos-value"};
      if (bookDifference < 0) {wBookDif = "table-neg-value"};

      if (weeklyPersonalTaxReturn === 0) {wPTR = "table-0-value"};
      if (WTargetPersonalTaxReturn === 0) {wTPTR = "table-0-value"}; 
      if (ptrDifference >= 0) {wPTRDif = "table-pos-value"};
      if (ptrDifference < 0) {wPTRDif = "table-neg-value"};

      if (weeklyAccountsProduction === 0) {wAccProd = "table-0-value"};
      if (WTargetAccountsProduction === 0) {wTAccProd = "table-0-value"}; 
      if (accProdDifference >= 0) {wAccProdDif = "table-pos-value"};
      if (accProdDifference < 0) {wAccProdDif = "table-neg-value"};

      return (
        <tr key={index} className={rowClass}>
          <td>{fName}</td>
          <td>{lName}</td>
          <td className={wVat}>{weeklyVAT}</td>
          <td className={wTVat}>{WTargetVATReturn}</td>
          <td className={wVatDif}>{vatDifference}</td>
          <td className={wPAYE}>{weeklyPAYE}</td>
          <td className={wTPAYE}>{WTargetPAYE}</td>
          <td className={wPAYEDif}>{payeDifference}</td>
          <td className={wBook}>{weeklyBookkeeping}</td>
          <td className={wTBook}>{WTargetBookkeeping}</td>
          <td className={wBookDif}>{bookDifference}</td>
          <td className={wPTR}>{weeklyPersonalTaxReturn}</td>
          <td className={wTPTR}>{WTargetPersonalTaxReturn}</td>
          <td className={wPTRDif}>{ptrDifference}</td>
          <td className={wAccProd}>{weeklyAccountsProduction}</td>
          <td className={wTAccProd}>{WTargetAccountsProduction}</td>
          <td className={wAccProdDif}>{accProdDifference}</td>
        </tr>
      )
    })
  };

  const totalsData = () => {

    function add(accumulator, a) {
      return accumulator + a;
    };

    const allVat = totalVat.reduce(add, 0);
    const allVatTarget = totalVatTarget.reduce(add, 0);
    const allPaye = totalPaye.reduce(add, 0);
    const allPayeTarget = totalPayeTarget.reduce(add, 0);
    const allBookkeeping = totalBookeeping.reduce(add, 0);
    const allBookkeepingTarget = totalBookkeepingTarget.reduce(add, 0);
    const allPtr = totalPtr.reduce(add, 0);
    const allPtrTarget = totalPtrTarget.reduce(add, 0);
    const allAccProd = totalAccProd.reduce(add, 0);
    const allAccProdTarget = totalAccProdTarget.reduce(add, 0);

    const allVatDif = totalVatDif.reduce(add, 0);
    const allPayeDif = totalPayeDif.reduce(add, 0);
    const allBookkeepingDif = totalBookkeepingDif.reduce(add, 0);
    const allPtrDif = totalPtrDif.reduce(add, 0);
    const allAccProdDif = totalAccProdDif.reduce(add, 0);

    let cVat = "";
    let cTVat = "";
    let cVatDif = "";
    let cPaye = "";
    let cTPaye = "";
    let cPayeDif = "";
    let cBookkeeping = "";
    let cTBookkeeping = "";
    let cBookkeepingDif = "";
    let cPtr = "";
    let cTPtr = "";
    let cPtrDif = "";
    let cAccProd = "";
    let cTAccProd = "";
    let cAccProdDif = "";

    // Style Numbers
    if (allVat === 0) {cVat = "table-0-value"};
    if (allVatTarget === 0) {cTVat = "table-0-value"};
    if (allVatDif >= 0) {cVatDif = "table-pos-value"};
    if (allVatDif < 0) {cVatDif = "table-neg-value"};

    if (allPaye === 0) {cPaye = "table-0-value"};
    if (allPayeTarget === 0) {cTPaye = "table-0-value"};
    if (allPayeDif >= 0) {cPayeDif = "table-pos-value"};
    if (allPayeDif < 0) {cPayeDif = "table-neg-value"};

    if (allBookkeeping === 0) {cBookkeeping = "table-0-value"};
    if (allBookkeepingTarget === 0) {cTBookkeeping = "table-0-value"};
    if (allBookkeepingDif >= 0) {cBookkeepingDif = "table-pos-value"};
    if (allBookkeepingDif < 0) {cBookkeepingDif = "table-neg-value"};

    if (allPtr === 0) {cPtr = "table-0-value"};
    if (allPtrTarget === 0) {cTPtr = "table-0-value"};
    if (allPtrDif >= 0) {cPtrDif = "table-pos-value"};
    if (allPtrDif < 0) {cPtrDif = "table-neg-value"};

    if (allAccProd === 0) {cAccProd = "table-0-value"};
    if (allAccProdTarget === 0) {cTAccProd = "table-0-value"};
    if (allAccProdDif >= 0) {cAccProdDif = "table-pos-value"};
    if (allAccProdDif < 0) {cAccProdDif = "table-neg-value"};

    let rowClass = "totalsRow";

    return (
      <tr className={rowClass}>
        <td>Company</td>
        <td>Totals</td>
        <td className={cVat}>{allVat}</td>
        <td className={cTVat}>{allVatTarget}</td>
        <td className={cAccProdDif}>{allVatDif}</td>
        <td className={cPaye}>{allPaye}</td>
        <td className={cTPaye}>{allPayeTarget}</td>
        <td className={cPayeDif}>{allPayeDif}</td>
        <td className={cBookkeeping}>{allBookkeeping}</td>
        <td className={cTBookkeeping}>{allBookkeepingTarget}</td>
        <td className={cBookkeepingDif}>{allBookkeepingDif}</td>
        <td className={cPtr}>{allPtr}</td>
        <td className={cTPtr}>{allPtrTarget}</td>
        <td className={cPtrDif}>{allPtrDif}</td>
        <td className={cAccProd}>{allAccProd}</td>
        <td className={cTAccProd}>{allAccProdTarget}</td>
        <td className={cAccProdDif}>{allAccProdDif}</td>
      </tr>
    )
  };

  const handleGetMetomic = (event) => {
    event.preventDefault();

    axios.get(process.env.REACT_APP_SERVER_ROUTE + "api/testsenta")
    .then(res => {
      const response = res.data;
      console.log("message is - " + response.message);
      console.log("data is - " + response.jobs);
    });
  };


  
  



  if( isLoggedIn === true) {
  
    return (
      <div className="container-2">
          <Header title="This Weeks Metrics" hello="true"/>
          <div className="quarterly-charts__nav">

            <h2 className="quarterly-charts__title">Quarterly Charts</h2>

            <form onSubmit={navQVat}>
              <button className="main-button main-button--float-left" type ="submit">VAT</button>
            </form>

            <form onSubmit={navQPaye}>
              <button className="main-button main-button--float-left" type ="submit">PAYE</button>
            </form>

            <form onSubmit={navQBookkeeping}>
              <button className="main-button main-button--float-left" type ="submit">Bookkeeping</button>
            </form>

            <form onSubmit={navQPtr}>
              <button className="main-button main-button--float-left" type ="submit">PTR</button>
            </form>

            <form onSubmit={navQAccProd}>
              <button className="main-button main-button--float-left" type ="submit">Acc Prod</button>
            </form>

          </div>


        <div className="container-2">
          <table id="employeetable" className="employeeTable">
            <tbody>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>VAT</th>
                <th>VAT Target</th>
                <th>VAT +/-</th>
                <th>PAYE</th>
                <th>PAYE Target</th>
                <th>PAYE +/-</th>
                <th>Bookkeeping</th>
                <th>Bookeeping Target</th>
                <th>Book +/-</th>
                <th>PTR</th>
                <th>PTR Target</th>
                <th>PTR +/-</th>
                <th>Acc Prod</th>
                <th>Acc Prod Target</th>
                <th>Acc Prod +/-</th>
              </tr>
              {tableData()}
              {totalsData()}
            </tbody>
                    
          </table>
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

export default JobMetrics;
