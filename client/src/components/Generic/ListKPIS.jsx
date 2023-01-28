import React from "react";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setActiveBudget } from "../actions/setActiveBudget";
import { navigate } from "hookrouter";
// Generic Modules
import msToTime from "./msToTime";

function ListKPIS (props) {

  const access = useSelector(state => state.userAccess);
  let kpis = useSelector(state => state.kpiTemplates);
  let roles = useSelector(state => state.kpiRoles);
  const dispatch = useDispatch();

  let jobRole = false;
  const newJobRole = props.jobRole;

  console.log("New Job Role is - " + newJobRole);

  if (newJobRole !== undefined) {

    kpis = [];
    const selectedRole = roles.find(role => role.Name === newJobRole);

    if(selectedRole !== undefined) {
      for(let i = 0; i< selectedRole.KPIs.length; i++) {
        let newKPI = {
          _id: i,
          Name: selectedRole.KPIs[i],
        };
  
        kpis.push(newKPI);
      };
    };
    
    

  };

  function add(accumulator, a) {
    return accumulator + a;
  };
  

  function selectBudget (e) {
    e.preventDefault();

    if(access === "Admin") {
      const selectedBudget = e.currentTarget.getAttribute("data-item");
    store.dispatch(setActiveBudget(selectedBudget));
    navigate("/editkpi");
    };
    
  };


  return (
    <div className="">
      <table id="kpitable" className="kpi__table">
        <tbody>
          <tr>
            <th className="addkpi__th">KPI Name</th>
          </tr>

          {kpis !== null || kpis !== undefined || newJobRole === undefined || newJobRole === "No Role Selected" ? kpis.map((item, i) => (
          
            <tr key={i} data-item={item._id} onClick={selectBudget} className="table__select-row--1">
              <td>{item.Name}</td>
            </tr>
            
          )) : <tr></tr>}
                

        </tbody>
      </table>

    </div>
          
  )
};

export default ListKPIS;