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

function XeroMatch () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const clients = useSelector(state => state.clients);
    const activeClient = useSelector(state => state.activeClient);
    const dispatch = useDispatch();

    const [ tenants, setTenants] = useState ([]);
    const [currentTenantMatch, setCurrentTenant] = useState("none");
    const [currentTenantID, setCurrentTenantID] = useState("");

    
    const [loading, setLoading] = useState(true);

    const currentClient = clients.find(c => c._id === activeClient);

    const [ tenantDetails, setTenant] = useState ({
      company: company,
      clientName: currentClient.ClientName,
      tenantName: ""
    });


    useEffect(() => {

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "xero/gettenants", {tenantDetails})
          .then(res => {
            console.log(res.data.message);
            setTenants(res.data.tenants);
            const newTenants = res.data.tenants;
            const match = newTenants.find(t => t.tenantId === currentClient.XeroTenantID);
         
            if(match !== undefined) {
              setCurrentTenant(match.tenantName);
            };  
              
            setLoading(false);
            
          });

    },[]);

    useEffect(() => {
      const selectedTenant = tenants.find(t => t.tenantName === tenantDetails.tenantName);

      if(selectedTenant !== undefined) {
        setCurrentTenantID(selectedTenant.tenantId);
      };
      

    },[tenantDetails]);


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

    async function handleSetTenant (event) {
        event.preventDefault();
        setLoading(true);

        const tenantDetails2 = {
          company: company,
          clientId: currentClient._id,
          tenantId: currentTenantID,
        };
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "xero/settenanttoclient", {tenantDetails2})
          .then(res => {
            setLoading(false);
            store.dispatch(setClients(res.data.clients));
            navigate("/clientdetails");
          });

    };


    

   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Xero Match"/>
                <ClientDetailsNav />

                <div className="container-2 row-settings">
                    <h4 className="page-title">Match Client to Xero Tenant</h4>
                    <h4 className="page-title">{currentClient.ClientName}</h4>
                    <h4 className="">is currently matched to</h4>
                    <h4 className="">{currentTenantMatch}</h4>

                        <form onSubmit={handleSetTenant}>
                            <select onChange={handleChange} type="text" value={tenantDetails.tenantName} className="selector selector__time-unit" id="tenantName" name="tenantName" required>
                                <option>No Tenant Selected</option>
                                {tenantSelector()}
                            </select>
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


export default XeroMatch;