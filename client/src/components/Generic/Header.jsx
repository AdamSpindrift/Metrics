import React from "react";
// Custom Modules
import WelcomeMessage from "../Generic/WelcomeMessage";
import Nav from "../Generic/Nav";
// Store
import { useSelector } from "react-redux";
import store from "../store";

function Header (props) {

    const logo = useSelector(state => state.logo);
    const company = useSelector(state => state.company);
    const logoName = company + " Logo";

    return (
        <div className="header">
            <Nav />
            <h1 className="header__title">{props.title}</h1>
            {props.hello ?
            <WelcomeMessage /> : <div>&nbsp;</div>}
            {logo === "" ?
            <img src="https://metricsuploads.s3.eu-west-2.amazonaws.com/metrics_logo_white_500x280.png" alt="Metrics Logo" className="company-logo"></img> : <img src={logo} alt={logoName} className="company-logo"></img>}
        </div>
    );
};

export default Header;