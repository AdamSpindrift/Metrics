import {applyMiddleware, compose, createStore} from "redux";
import rootReducers from "./reducers/index";
import thunk from "redux-thunk";
require("dotenv").config()

const composeEnhancers = (process.env.NODE_ENV !== "production" && typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducers, composeEnhancers(applyMiddleware(thunk)));

export default store;