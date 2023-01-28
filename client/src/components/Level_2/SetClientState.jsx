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

function SetClientState () {
    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const clients = useSelector(state => state.clients);
    const activeClient = useSelector(state => state.activeClient);
    const teams = useSelector(state => state.teams);
    const dispatch = useDispatch();
    
    const [loading, setLoading] = useState(false);

    const currentClient = clients.find(c => c._id === activeClient);

    const [ clientDetails, setClient] = useState ({
      company: company,
      clientName: currentClient.ClientName,
      clientId: currentClient._id,
      state: currentClient.ClientState,
      team: "",
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

    const teamSelector = () => {
      return teams.map((t, i) => {
  
        return (
          <option key={i}>{t}</option>
        )
      })
    };


    async function handleSetClient (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/setclientstate", {clientDetails})
          .then(res => {
            const clients = res.data.clients;
            store.dispatch(setClients(clients));
            setLoading(false);
            navigate('/clientdetails');
          });

    };


    async function handleSetTeam(event) {
      event.preventDefault();
      setLoading(true);
      
      axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/setclientteam", {clientDetails})
        .then(res => {
          const clients = res.data.clients;
          store.dispatch(setClients(clients));
          setLoading(false);
          navigate('/clientdetails');
        });

  };

   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Set Client State"/>
                <ClientDetailsNav />

                <div className="container-2">
                    <form onSubmit={handleSetClient}>
                        <h4 className="form__input-label margin-top-small">Set Client State</h4>
                            <select onChange={handleChange} type="text" value={clientDetails.state} className="selector" id="state" name="state" required>
                              <label for="access">State</label>
                                <option>Client</option>
                                <option>Former client</option>

                            </select>

                            <button className="main-button main-button--large" type="submit">Submit</button>
                    </form>

                    <form onSubmit={handleSetTeam}>
                        <h4 className="form__input-label margin-top-small">Set Client Team</h4>
                            <select onChange={handleChange} type="text" value={clientDetails.team} className="selector" id="team" name="team" required>
                              <label for="access">State</label>
                                <option>""</option>
                                {teamSelector()}

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


export default SetClientState;