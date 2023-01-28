import React, { useState, Fragment, useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import FilterCenter from "../Generic/FilterCenter";
import FilteredClientList from "../Generic/FilteredClientList";
import capitalizeWords from "../Generic/capitalizeWords";
require("dotenv").config()

function Clients () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const clientsStore = useSelector(state => state.clients);
    const dispatch = useDispatch();

    // Clients Filter
    const [word, setWord] =useState("");
    const [clients, setJobs] = useState(clientsStore);
    const [filterDisplay, setFilterDisplay] = useState([]);

    const handleChange = e => {
        setWord(e);
        let oldList = clients.map(c => {
            return { ClientName: c.ClientName.toLowerCase(), AccManager: c.AccManager, ClientState: c.ClientState, _id: c._id, ProfitLossMilliseconds: c.ProfitLossMilliseconds, ProfitLossFee: c.ProfitLossFee, AHR: c.AHR };
        });

        if (word !== "") {
            let newList = [];

            newList = oldList.filter(client => 
                client.ClientName.includes(word.toLowerCase())
            );

            setFilterDisplay(newList);
        };

        if (word === "") {
            setFilterDisplay(clients);
        };
    }


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Clients"/>
                <FilterCenter value={word} handleChange={e => handleChange(e.target.value)} />
                <FilteredClientList list={word.length < 1 ? clients : filterDisplay} />
            </div>
        ) 
    } else {
        return (
          <PleaseLogin />
        )
    };
};


export default Clients;