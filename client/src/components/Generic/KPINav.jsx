import React from "react";
import {navigate} from "hookrouter";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";

function KPINav() {

    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    const navKPIDash = () => {
        
        navigate("/kpi");
    };

    const navAddKPI = () => {
        
        navigate("/createkpi");
    };

    const navSetKPITarget = () => {
        
        navigate("/setkpitarget");
    };

    const navSetKPI = () => {
        
        navigate("/setkpi");
    };

    

    if (isLoggedIn === true) {
    return (
        <div className="navigation-settings">

            <div className="navigation-settings__background">&nbsp;</div>

            <div className="navigation-settings__nav">
            
                <ul className="navigation-settings__list">
                    <li className="navigation-settings__item">
                        <form onSubmit={navKPIDash}>
                            <button className="navigation-settings__link" type ="submit">KPIs Dash</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navAddKPI}>
                            <button className="navigation-settings__link" type ="submit">Create KPIs</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navSetKPITarget}>
                            <button className="navigation-settings__link" type ="submit">Set Targets</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navSetKPI}>
                            <button className="navigation-settings__link" type ="submit">Set KPIs</button>
                        </form>
                    </li>
                    
                </ul>
            </div>
        </div>
    )
    } else {
        return (<div>&nbsp;</div>);
    };
};

export default KPINav;