import "./styles.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
// State
import {Provider} from "react-redux";
import store from "./components/store";
// Environment Variables
require('dotenv').config();

ReactDOM.render(
        <Provider store = {store}>
            <App />
        </Provider>
    , document.getElementById("root"));