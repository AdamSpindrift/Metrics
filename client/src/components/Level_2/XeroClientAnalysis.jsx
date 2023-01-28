import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
// State
import { useSelector, useDispatch } from "react-redux";
import store from "../store";
import { setClients } from "../actions/setClients";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import ClientDetailsNav from "../Generic/ClientDetailsNav";
import Loading from "../Generic/Loading";
import msToTime from "../Generic/msToTime";
require("dotenv").config()

function XeroClientAnalysis () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const clients = useSelector(state => state.clients);
    const activeClient = useSelector(state => state.activeClient);
    const globalJobs = useSelector(state => state.jobs);
    const dispatch = useDispatch();

    function add(accumulator, a) {
      return accumulator + a;
    };

    const [ xeroData, setXeroData] = useState ({
      transactions: [],
    });
    

    
    const [loading, setLoading] = useState(true);

    const currentClient = clients.find(c => c._id === activeClient);

    const [ clientDetails, setTenant] = useState ({
      company: company,
      clientId: activeClient,
    });

    const clientJobs = globalJobs.filter(job => job.ClientId === activeClient);
    const bookFilter = "bookeeping";

    const bookkeepingJobs = clientJobs.filter(j => j.Title.toLowerCase().includes("bookkeeping"));


    useEffect(() => {


        axios.post(process.env.REACT_APP_SERVER_ROUTE + "xero/getxerodata", {clientDetails})
          .then(res => {
            console.log(res.data.message);

            const foundT = res.data.transactions;

            let newTransactions = [];

            for( let i = 0; i < foundT.length; i++ ) {

              const matchJobs = bookkeepingJobs.filter(j => format(new Date(j.Date), "LLLL") === format(new Date(foundT[i].Date), "LLLL"));

              const jobTime = matchJobs.map(j => j.Duration);
              const jt = jobTime.filter(function (value) {
                return !Number.isNaN(value);
              });
              const ru = jt.filter(j=> j !== undefined);
              const totalJobTime = ru.reduce(add, 0);

              const budgetFees = matchJobs.map(j => j.BudgetFee);
              const bf = budgetFees.filter(function (value) {
                return !Number.isNaN(value);
              });
              const budget = bf.reduce(add, 0);

              const budgetT = matchJobs.map(j => j.BudgetMilliseconds);
              const bt = budgetT.filter(function (value) {
                return !Number.isNaN(value);
              });
              const budgetTime = bt.reduce(add, 0);

              const pl = matchJobs.map(j => j.ProfitLossMilliseconds);
              const plRN = pl.filter(function (value) {
                return !Number.isNaN(value);
              });
              const plTime = plRN.reduce(add, 0);
              
              const fpt = budget/foundT[i].BankTransactions;

              const newObject = {
                date: new Date(foundT[i].Date),
                bankTransactions: foundT[i].BankTransactions,
                purchaseInvoices: foundT[i].PurchaseInvoices,
                salesInvoices: foundT[i].SalesInvoices,
                reconciled: foundT[i].UnReconciled,
                jobDuration: totalJobTime,
                budgetFee: budget,
                budgetTime: budgetTime,
                profitLossTime: plTime,
                feePerTransaction: fpt,
              };

              newTransactions.push(newObject);

            };
            

              

            setTimeout(() => {

              const sortedTransactions = newTransactions.sort(function(a,b){
                return b.date - a.date;
              });

              setXeroData({
                transactions: sortedTransactions,
              }); 

              setLoading(false);

            }, 100);

          });

    },[]);


    const tenantSelector = () => {
        return tenants.map((t, i) => {
    
          return (
            <option key={i}>{t.tenantName}</option>
          )
        })
    };

    function handleChange(event) {
        const{name, value} = event.target;
    
        setTenant((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    


    

   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Xero Client Analysis"/>
                <ClientDetailsNav />

                <div className="container-2 row-settings">

                  <h2>{currentClient.ClientName}</h2>

                 <br></br>
                  {xeroData.transactions.map((item, i) => (

                    <div className="row" key={i}>
                      <div className="col-1-of-2">
                          <h3>{format(new Date(item.date), "LLLL yyyy")}</h3>
                          <h4>Bank Transactions: {item.bankTransactions}</h4>
                          <h4>Purchase Invoices: {item.purchaseInvoices}</h4>
                          <h4>Sales Invoices: {item.salesInvoices}</h4>
                          <h4>Un-Reconciled: {item.reconciled}</h4>
                      </div>

                      <div className="col-2-of-2">
                        <h4>Job Duration: {msToTime(item.jobDuration)}</h4>
                        <h4>Budget Fee: £{Math.round((item.budgetFee + Number.EPSILON) * 100) /100}</h4>
                        <h4>Budget Time: {msToTime(item.budgetTime)}</h4>
                        <h4>Profit/Loss Time: {msToTime(item.profitLossTime)}</h4>
                        <h4>Fee per Bank Transaction: £{Math.round((item.feePerTransaction + Number.EPSILON) * 100) /100}</h4>
                      </div>

                    </div>
                  ))}
                   

                </div>

                
                {loading === true ? <Loading /> : <div>&nbsp;</div>}
                
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default XeroClientAnalysis;