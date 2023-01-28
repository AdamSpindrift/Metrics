import React from "react";
import {useRoutes} from "hookrouter";
import routes from "./Router";
import Login from './Level_0/Login';


function App() {

  const routeResult = useRoutes(routes);
    
    return (
    routeResult || <Login />
    );
  };

  export default App;
