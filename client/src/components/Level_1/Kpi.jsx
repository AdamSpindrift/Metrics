import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import {setKpiRoles} from "../actions/setKpiRoles";
import {setKpis} from "../actions/setKpis";
import {setKpiTemplates} from "../actions/setKpiTemplates";
import {setUsers} from "../actions/setUsers";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import KPINav from "../Generic/KPINav";
import Loading from "../Generic/Loading";
require("dotenv").config()

function KPI () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const getKPI = () => {
        setLoading(true);

        const company2 = {
            company: company, 
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/getcompanykpi", {company2})
            .then(res => {
                const companyKPI = res.data.companykpi;
                store.dispatch(setKpiRoles(companyKPI.JobRoles));
                store.dispatch(setKpis(companyKPI.KPIs));
                store.dispatch(setKpiTemplates(companyKPI.KPITemplates));
                store.dispatch(setUsers(res.data.users));
                setLoading(false);
                // navigate("/kpi");
            });
    };

    useEffect(() => {
        getKPI();
    }, []);



    

    return (
        <div className="container-2">
            <Header title="KPI"/>
            <KPINav />

            <div className="kpi-dash">
                <tbody className="kpi-dash__user-table">
                    <tr className="table-lines-2">
                        <th className="table-lines-2">User Name</th>
                        <th className="table-lines-2">KPI Name</th>
                        <th className="table-lines-2">Target</th>
                        <th className="table-lines-2">Actual</th>
                    </tr>
                        
                        <tr className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">Adam Power</td>
                            <td className="table-lines-2">Learning Points Reviewed by MD</td>
                            <td className="table-lines-2">6</td>
                            <td className="table-lines-2">4</td>
                        </tr>

                        <tr className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">Adam Power</td>
                            <td className="table-lines-2">Team turnaround time</td>
                            <td className="table-lines-2">5</td>
                            <td className="table-lines-2">7</td>
                        </tr>

                        <tr className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">Daniela Mattia</td>
                            <td className="table-lines-2">New Clients</td>
                            <td className="table-lines-2">3</td>
                            <td className="table-lines-2">4</td>
                        </tr>

                        <tr className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">Daniela Mattia</td>
                            <td className="table-lines-2">Referrals generated</td>
                            <td className="table-lines-2">7</td>
                            <td className="table-lines-2">8</td>
                        </tr>
                        
                </tbody>

            </div>

            


            {loading === true ? <Loading /> : <div>&nbsp;</div>}
        </div>
    );
};


export default KPI;