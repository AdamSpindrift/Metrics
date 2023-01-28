import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { format, endOfMonth, subMonths, getMonth, getYear } from "date-fns";
import { CSVLink } from "react-csv";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import Loading from "../Generic/Loading";
require("dotenv").config()

function BankTransactionAnalysis () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const clients = useSelector(state => state.clients);
    const transactions = useSelector(state => state.transactions);
    const teams = useSelector(state => state.teams);


    const bookkeepingTimestamps = globalTimestamps.filter(t => t.JobTitle.toLowerCase().includes("bookkeeping"));
    const allBookkeepingClients = bookkeepingTimestamps.map(t => ({ClientId: t.ClientId, ClientName: t.ClientName}));
    const ids = allBookkeepingClients.map(c => c.ClientId);
    const uniqueBookkeepingClients = allBookkeepingClients.filter(({ClientId}, index) => !ids.includes(ClientId, index + 1) );


    const bookkeepingClientsSorted = uniqueBookkeepingClients.sort((a,b) => (a.ClientName > b.ClientName) ? 1 : ((b.ClientName > a.ClientName) ? -1 : 0));
    const dispatch = useDispatch();

    
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState({
        month: format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
        team: "No Team Selected",
    });
    const [tableArray, setTableArray] = useState([]);

    const monthArray = [
        format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),2)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),3)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),4)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),5)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),6)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),7)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),8)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),9)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),10)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),11)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),12)), "dd/MM/yyyy"),
    ];

    

    useEffect(() =>{

        setLoading(true);

        const build = [];

        const dateArray = month.month.split("/");
        const date = endOfMonth(new Date(dateArray[2], dateArray[1]-1, dateArray[0]));
        const transactionsMonth1 = transactions.filter(t => getMonth(new Date(t.Date)) === getMonth(new Date(date)) && getYear(new Date(t.Date)) === getYear(new Date(date)));
        const transactionsMonth2 = transactions.filter(t => getMonth(new Date(t.Date)) === getMonth(new Date(date))-1 && getYear(new Date(t.Date)) === getYear(new Date(date)));
        const transactionsMonth3 = transactions.filter(t => getMonth(new Date(t.Date)) === getMonth(new Date(date))-2 && getYear(new Date(t.Date)) === getYear(new Date(date)));
        


        for(let i=0; i<bookkeepingClientsSorted.length; i++) {

            let highBand = 0;
            let lowBand = 0;
            let newHigh = 0;
            let newLow = 0;
            let transactionsM1 = 0;
            let transactionsM2 = 0;
            let transactionsM3 = 0;
            let rePrice = "No";
            let round1 = 0;
            let round2 = 0;
            let round3 = 0;
            const tObject1 = transactionsMonth1.find(t => t.ClientName === bookkeepingClientsSorted[i].ClientName);
            const tObject2 = transactionsMonth2.find(t => t.ClientName === bookkeepingClientsSorted[i].ClientName);
            const tObject3 = transactionsMonth3.find(t => t.ClientName === bookkeepingClientsSorted[i].ClientName);
            const tClient = clients.find(c => c.ClientName === bookkeepingClientsSorted[i].ClientName);
            
            
            if(tClient.hasOwnProperty("TransactionBandHigh") && tClient.hasOwnProperty("TransactionBandLow")) {
                highBand = tClient.TransactionBandHigh;
                lowBand = tClient.TransactionBandLow;
            };
            

            if(tObject1 !== undefined) {
                let bank = tObject1.BankTransactions;
                let telleroo = tObject1.TellerooTransactions;
                let payRuns = tObject1.TellerooPaymentRuns;

                transactionsM1 = ((bank + telleroo) - payRuns);
                round1 = (Math.ceil(transactionsM1 / 50) * 50);
            };

            if(tObject2 !== undefined) {
                let bank = tObject2.BankTransactions;
                let telleroo = tObject2.TellerooTransactions;
                let payRuns = tObject2.TellerooPaymentRuns;

                transactionsM2 = ((bank + telleroo) - payRuns);
                round2 = (Math.ceil(transactionsM2 / 50) * 50);
            };

            if(tObject3 !== undefined) {
                let bank = tObject3.BankTransactions;
                let telleroo = tObject3.TellerooTransactions;
                let payRuns = tObject3.TellerooPaymentRuns;

                transactionsM3 = ((bank + telleroo) - payRuns);
                round3 = (Math.ceil(transactionsM3 / 50) * 50);
            };


            if(transactionsM1 > highBand && transactionsM2 > highBand && transactionsM3 > highBand) {
                rePrice = "Yes";
            };

            if(transactionsM1 < lowBand && transactionsM2 < lowBand && transactionsM3 < lowBand) {
                rePrice = "Yes";
            };

            newHigh = Math.max(round1, round2, round3);
            newLow = (newHigh - 50);

            if(newHigh === 0) {
                newHigh = 50;
                newLow = 0;
            };


            const object = {
                clientName: bookkeepingClientsSorted[i].ClientName,
                transactionBanding: lowBand + " - " + highBand,
                transactionsMonth1: transactionsM1,
                transactionsMonth2: transactionsM2,
                transactionsMonth3: transactionsM3,
                rePrice: rePrice,
                newBanding: newLow + " - " + newHigh,
            };

            if(tClient.ClientState === "Client") {

                if(month.team === "No Team Selected") {
                    build.push(object);
                };

                if(month.team === tClient.Team) {
                    build.push(object);
                };
                
            };

            if(i === bookkeepingClientsSorted.length-1) {
                setTableArray(build);
            };

        };

        



        setLoading(false)
        
    },[month]);

    const monthSelector = () => {
        return monthArray.map((m, i) => {
    
          return (
            <option key={i}>{m}</option>
          )
        })
    };

    const teamSelector = () => {
        return teams.map((t, i) => {
    
          return (
            <option key={i}>{t}</option>
          )
        })
      };

    

    function handleChange(event) {
        const{name, value} = event.target;
    
        setMonth((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };


    
    if( isLoggedIn === true) {

        return (
            <div className="container-2">
                <Header title="Transaction Banding Report"/>

                <div className="bookkeeping-transaction-report">

                

                    <form className="bookkeeping-transaction-report__form margin-top-small">
                        <div>
                            <h4 className="form__input-label">Month</h4>
                            <select onChange={handleChange} type="text" value={month.month} className="selector" id="month" name="month" required>
                                <option>No Month Selected</option>
                                {monthSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <form className="bookkeeping-transaction-report__form bookkeeping-transaction-report__form--team margin-top-small">
                        <div>
                            <h4 className="form__input-label">Team</h4>
                            <select onChange={handleChange} type="text" value={month.team} className="selector" id="team" name="team" required>
                                <option>No Team Selected</option>
                                {teamSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <CSVLink
                        data={tableArray}
                        filename={"Transaction Banding Report for " + month.month + " - " + month.team}
                        className="main-button main-button--large bookkeeping-transaction-report__download"
                        target="_blank">
                    Download CSV
                    </CSVLink>

                    



                    {<table id="bookkeepingtransactiontable" className="bookkeeping-transaction-report__table">

                        <tbody>
                            <tr className="table-lines-2 bookkeeping-transaction-report__table--row">
                                <th className="bookkeeping-transaction-report__table--colmedium">Client Name</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Current Banding</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">New Banding</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Transactions in Month 1</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Transactions in Month 2</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Transactions in Month 3</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Re-Price Client</th>
                            </tr>
                            {tableArray.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2 bookkeeping-transaction-report__table--row">
                                    <td className="table-lines-2">{item.clientName}</td>
                                    <td className="table-lines-2">{item.transactionBanding}</td>
                                    {item.rePrice === "Yes" ? <td className="table-lines-2">{item.newBanding}</td> : <td className="table-lines-2"></td>}
                                    <td className="table-lines-2">{item.transactionsMonth1}</td>
                                    <td className="table-lines-2">{item.transactionsMonth2}</td>
                                    <td className="table-lines-2">{item.transactionsMonth3}</td>
                                    {item.rePrice === "Yes" ? <td className="table-lines-2 bookkeeping-transaction-report__re-price-yes">{item.rePrice}</td> : <td className="table-lines-2">{item.rePrice}</td>}
                                </tr>
                            ))}
                        </tbody>

                    </table> }

                </div>
                
                {loading === true ? <Loading /> : <div>&nbsp;</div>}

            </div>
        );
    };

    if (isLoggedIn !== true) {
        return (
        <PleaseLogin />
        )
    };
};


export default BankTransactionAnalysis;