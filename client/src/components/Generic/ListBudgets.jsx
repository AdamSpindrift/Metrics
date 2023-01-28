import React from "react";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setActiveBudget } from "../actions/setActiveBudget";
import { navigate } from "hookrouter";
// Generic Modules
import msToTime from "../Generic/msToTime";
import msToTime2 from "../Generic/msToTime2";


function ListBudgets (props) {

  const access = useSelector(state => state.userAccess);
  const dispatch = useDispatch();

  const budgets = props.budgets;

  function add(accumulator, a) {
    return accumulator + a;
  };

  const allBudgetFees = budgets.map(a => {return (parseInt(a.TotalBudget))});
  
  const totalYearlyBudget = allBudgetFees.reduce(add, 0);
  

  function selectBudget (e) {
    e.preventDefault();

    if(access === "Admin") {
      const selectedBudget = e.currentTarget.getAttribute("data-item");
    store.dispatch(setActiveBudget(selectedBudget));
    navigate("/budgets");
    };
    
  };


  return (
    <div className="">
      <table id="budgettable" className="clients__budget-details">
        <tbody>
          <tr>
            <th className="clients__budget-name">Budget Name</th>
            <th className="clients__budget-frequency">Frequency</th>
            {access === "Admin" ? 
            <th className="clients__yearly-budget">Yearly Budget</th> : <div>&nbsp;</div>}
            <th className="clients__yearly-budget-hours">Yearly Time Budget hh:mm</th>
            {access === "Admin" ? 
            <th className="clients__budget-fee-per-job">Fee Per Job</th> : <div>&nbsp;</div>}
            <th className="clients__budget-time-per-job">Time per Job hh:mm</th>
          </tr>

          {budgets.map((item, i) => (
          
            <tr key={i} data-item={item._id} onClick={selectBudget} className="table__select-row--1">
              <td>{item.Title}</td>
              <td>{item.Frequency}</td>
              {access === "Admin" ? 
              <td>£{item.TotalBudget.toLocaleString()}</td> : <div>&nbsp;</div> }
              <td>{String(item.TotalBudgetHours).padStart(2, 0)}:{String(item.TotalBudgetMinutes).padStart(2,0)}</td>
              {access === "Admin" ? 
              <td>£{Math.round((item.BudgetedFeePerJob + Number.EPSILON) * 100) /100}</td> : <div>&nbsp;</div> }
              <td>{msToTime2(item.BudgetedMillisecondsPerJob)}</td>
            </tr>
            
          ))}
            
                

        </tbody>
      </table>

      {access === "Admin" ? 
      <h3 className="justify">Total Yearly Budget: £{totalYearlyBudget.toLocaleString()}</h3> : <div>&nbsp;</div>}

    </div>
          
  )
};

export default ListBudgets;