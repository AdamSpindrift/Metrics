import React, { useState, Fragment, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import { setClients } from "../actions/setClients";
import store from "../store";
import Loading from "../Generic/Loading";

function ClientDetailsNav() {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const selectedClientID = useSelector(state => state.activeClient);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const clientDetails = {
        company: company,
        clientID: selectedClientID,
    };

    const [loading, setLoading] = useState(false);

    const navCurrentClient = () => {
        
        navigate("/clientdetails");
    };

    const navClients = () => {
        
        navigate("/clients");
    };

    const updateClient = (event) => {
        
        event.preventDefault();
        setLoading(true);
        
    
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/getclientupdate", {clientDetails})
          .then(res => {
            const clients = res.data.clients;
            store.dispatch(setClients(clients));
            setLoading(false);
            navigate('/clients');
          });

    };

    const updateBudgets = (event) => {
        
        event.preventDefault();
        setLoading(true);
        
    
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "uapi/newbudgetfornewjob", {clientDetails})
          .then(res => {
            const clients = res.data.clients;
            store.dispatch(setClients(clients));
            setLoading(false);
            navigate('/clients');
          });

    };

    const navXeroMatch = () => {
        
        navigate("/xeromatch");
    };

    const navXeroAnalysis = () => {
        
        navigate("/xeroclientanalysis");
    };

    const navTransactionBanding = () => {
        
        navigate("/transactionbanding");
    };

    const navSetClientState = () => {
        
        navigate("/clientstate");
    };


   

    if (isLoggedIn === true) {
    return (
        <div className="navigation-settings">

            <div className="navigation-settings__background">&nbsp;</div>

            <div className="navigation-settings__nav">
            
                <ul className="navigation-settings__list">
                <li className="navigation-settings__item">
                        <form onSubmit={navCurrentClient}>
                            <button className="navigation-settings__link" type ="submit">Current Client</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navClients}>
                            <button className="navigation-settings__link" type ="submit">Clients</button>
                        </form>
                    </li>
                    {/* <li className="navigation-settings__item">
                        <form onSubmit={updateClient}>
                            <button className="navigation-settings__link" type ="submit">Update Client</button>
                        </form>
                    </li> */}
                    {access === "Admin" ?
                    <li className="navigation-settings__item">
                        <form onSubmit={updateBudgets}>
                            <button className="navigation-settings__link" type ="submit">Add New Budgets</button>
                        </form>
                    </li>
                    : <li className="navigation-settings__item"></li>}
                    {access === "Admin" ?
                    <li className="navigation-settings__item">
                        <form onSubmit={navXeroAnalysis}>
                            <button className="navigation-settings__link" type ="submit">Xero Analysis</button>
                        </form>
                    </li>
                    : <li className="navigation-settings__item"></li>}
                    {access === "Admin" ?
                    <li className="navigation-settings__item">
                        <form onSubmit={navXeroMatch}>
                            <button className="navigation-settings__link" type ="submit">Match to Xero</button>
                        </form>
                    </li>
                    : <li className="navigation-settings__item"></li>}
                    {access === "Admin" ?
                    <li className="navigation-settings__item">
                        <form onSubmit={navTransactionBanding}>
                            <button className="navigation-settings__link" type ="submit">Transaction Banding</button>
                        </form>
                    </li>
                    : <li className="navigation-settings__item"></li>}
                    <li className="navigation-settings__item">
                        <form onSubmit={navSetClientState}>
                            <button className="navigation-settings__link" type ="submit">Set State</button>
                        </form>
                    </li>
                    
                </ul>
            </div>
            {loading === true ? <Loading /> : <div>&nbsp;</div>}
        </div>
    )
    } else {
        return (<div>&nbsp;</div>);
    };
};

export default ClientDetailsNav;