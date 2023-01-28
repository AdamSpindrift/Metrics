import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import { setClients } from "../actions/setClients";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import ListBudgets from "../Generic/ListBudgets";
import FilteredJobListPL_Gen from "../Generic/FilteredJobListPL_Gen";
import ClientDetailsNav from "../Generic/ClientDetailsNav";
import Filter from "../Generic/Filter";
require("dotenv").config()

function ClientDetails () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    let clientsStore = useSelector(state => state.clients);
    const selectedClientID = useSelector(state => state.activeClient);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    let selectedClient = "";
    let visibleBudgets = [];


    if (clientsStore !== null) {
        selectedClient = clientsStore.find(client => client._id === selectedClientID);
        const selectedBudgets = selectedClient.Budgets; 
        visibleBudgets = selectedBudgets.filter(budget => budget.Visible === true);
    };

    

    if (clientsStore === null || undefined) {
        navigate("/clients");
    };



    // Jobs Filter
    const [word, setWord] = useState({
        word: "",
    });
    const [jobs, setJobs] = useState([]);
    const [filterDisplay, setFilterDisplay] = useState([]);

    let clientJobs = [];

    if(globalJobs.length !== 0) {
        clientJobs = globalJobs.filter(job => job.ClientId === selectedClientID);
    };

    useEffect(() => {
        setJobs(clientJobs);
    },[]);


    function handleChange(event) {
        const{name, value} = event.target;
    
        setWord((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    const clientDetails = {
        company: company,
        clientID: selectedClientID,
    };


   


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Client Details"/>
                <ClientDetailsNav />

                <div className="row">

                    <div className="col-1-fo-2">

                        <div className="clients__details">
                            <div className="clients__details__text float-left">
                                <h3>Name:</h3>
                                <h3>Id:</h3>
                                <h3>State:</h3>
                                <h3>Acc Manager:</h3>
                                {/* <h3>Yearly Fee:</h3>
                                <h3>Monthly Fee:</h3> */}
                                <h3>Transaction Band:</h3>
                                <h3>Team:</h3>
                                {/* <h3>ID:</h3> */}
                            </div>
                            <div className="clients__details__text">
                                <h3>{selectedClient.ClientName}</h3>
                                <h3>{selectedClient._id}</h3>
                                {selectedClient.ClientState === null || undefined ? <h3>Not Set</h3> : <h3>{selectedClient.ClientState}</h3>}
                                {selectedClient.AccManager === null || undefined ? <h3>Not Set</h3> : <h3>{selectedClient.AccManager}</h3>}
                                {/* {selectedClient.YearlyFee === null || undefined ? <h3>Not Set</h3> : <h3>£{selectedClient.YearlyFee.toLocaleString()}</h3>}
                                {selectedClient.YearlyFee === null || undefined ? <h3>Not Set</h3> : <h3>£{(selectedClient.YearlyFee/12.).toLocaleString()}</h3>} */}
                                {selectedClient.TransactionBandLow === undefined || selectedClient.TransactionBandHigh === undefined ? <h3>Not Set</h3> : <h3>{selectedClient.TransactionBandLow + " > " +selectedClient.TransactionBandHigh}</h3>}
                                <h3>{selectedClient.Team}</h3>
                                {/* <h3>{selectedClient._id}</h3> */}
                            </div>
                        </div>

                        <h2 className="clients__jobs-heading">Budgets</h2>

                        <div className="clients__budget-box">
                            {selectedClient.Budgets.length !== 0 ? <ListBudgets budgets={visibleBudgets}/> : <div>&nbsp;</div>}
                        </div>

                    </div>

                    <div className="col-1-of-2">
                            
                        {clientJobs.length !== 0 ? 

                            <div className="clients__jobs">
                                
                                <FilteredJobListPL_Gen list={clientJobs} word={word.word}/>
                            </div>

                        : <div>&nbsp;</div>}

                    </div>

                </div>
                
                
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
          )
    };
};


export default ClientDetails;