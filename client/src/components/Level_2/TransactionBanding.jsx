import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import store from "../store";
import { setClients } from "../actions/setClients";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import ClientDetailsNav from "../Generic/ClientDetailsNav";
import Loading from "../Generic/Loading";
require("dotenv").config()

function TransactionBanding () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const clients = useSelector(state => state.clients);
    const activeClient = useSelector(state => state.activeClient);
    const dispatch = useDispatch();

    const [ tenants, setTenants] = useState ([]);
    const [currentTenantMatch, setCurrentTenant] = useState("none");
    const [currentTenantID, setCurrentTenantID] = useState("");

    
    const [loading, setLoading] = useState(false);

    const currentClient = clients.find(c => c._id === activeClient);

    const [ clientDetails, setClient] = useState ({
      company: company,
      clientName: currentClient.ClientName,
      clientId: currentClient._id,
      lowBand: 0,
      highBand: 0,
    });

    function handleChange(event) {
        const{name, value} = event.target;
    
        setClient((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    async function handleSetClient (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/clientbanding", {clientDetails})
          .then(res => {
            setLoading(false);
            console.log(res.data.message);
            store.dispatch(setClients(res.data.clients));
            navigate("/clientdetails");
            setLoading(false);
          });

    };


    

   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Set Transaction Banding"/>
                <ClientDetailsNav />

                <div className="container-2 row-settings">
                    <h4 className="page-title">Set Transaction Banding for {currentClient.ClientName}</h4>

                        <form onSubmit={handleSetClient}>
                            <h4 className="form__input-label">Low Band</h4>
                            <input onChange={handleChange} type="number" value={clientDetails.lowBand} name="lowBand" placeholder="Low Band" required/>
                            <h4 className="form__input-label">High Band</h4>
                            <input onChange={handleChange} type="number" value={clientDetails.highBand} name="highBand" placeholder="High Band" required/>

                            <button className="main-button main-button--large" type="submit">Submit</button>
                        </form>

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


export default TransactionBanding;