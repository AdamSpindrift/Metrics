import React, { useState, useEffect } from "react";
import { getYear, getMonth } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
//Custom Modules
import removeDupes from "./removeDupes";
import AccountsProdHorizontalBar from "../Generic/AccountsProdHorizontalBar";


function AccountsProdChart () {

    const xLabel = "Duration (hrs)";
    const yLabel = "Clients";

    const [data, setData] = useState([
        {x: 1 , y: "Client 1"},
        {x: 3 , y: "Client 2"},
        {x: 2 , y: "Client 3"},
        
    ]);

    const allJobs = useSelector(state => state.jobs);
    const timeStamps = useSelector(state => state.allTimestamps);

    
    const currentJobs = allJobs.filter(j => j.Status === "ready");

    const [accProd, setJobType] = useState({
        jName: "Accounts production",
    });

    const [year, setYear] = useState({
      jYear: getYear(new Date()),
      jMonth: "All Months",
      status: "completed",
      hour: 7,
    });

    const [chartHeight, setChartHeight] = useState(500);

    const [chartWidth, setChartWidth] = useState((window.innerWidth * 0.70));

    function add(accumulator, a) {
        return accumulator + a;
      };

    useEffect(() => {

      let filteredJobs = [];

      if(year.status === "completed"){
        const completedJobs = allJobs.filter(j => j.Status === "completed");

        switch (year.jMonth) {
          case "All Months":
            filteredJobs = completedJobs;
            break;
          case "January" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 0, 1)));
            break;
          case "February" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 1, 1)));
            break;
          case "March" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 2, 1)));
            break;
          case "April" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 3, 1)));
            break;
          case "May" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 4, 1)));
            break;
          case "June" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 5, 1)));
            break;
          case "July" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 6, 1)));
            break;
          case "August" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 7, 1)));
            break;
          case "September" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 8, 1)));
            break;
          case "October" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 9, 1)));
            break;
          case "November" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 10, 1)));
            break;
          case "December" :
            filteredJobs = completedJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 11, 1)));
            break;
          default:
            filteredJobs = completedJobs;
          
        };
      };

      if(year.status === "ready"){
        const readyJobs = allJobs.filter(j => j.Status === "ready");

        switch (year.jMonth) {
          case "All Months":
            filteredJobs = readyJobs;
            break;
          case "January" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 0, 1)));
            break;
          case "February" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 1, 1)));
            break;
          case "March" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 2, 1)));
            break;
          case "April" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 3, 1)));
            break;
          case "May" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 4, 1)));
            break;
          case "June" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 5, 1)));
            break;
          case "July" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 6, 1)));
            break;
          case "August" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 7, 1)));
            break;
          case "September" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 8, 1)));
            break;
          case "October" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 9, 1)));
            break;
          case "November" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 10, 1)));
            break;
          case "December" :
            filteredJobs = readyJobs.filter(j => getMonth(new Date(j.Date)) === getMonth(new Date(2021, 11, 1)));
            break;
          default:
            filteredJobs = readyJobs;
          
        };
      };
        const selectedaccProdJobs = filteredJobs.filter(j => j.Title === accProd.jName);
        const selectedJobs = selectedaccProdJobs.filter(j => parseInt(getYear(new Date(j.Date))) === parseInt(year.jYear));

        const clients = selectedJobs.map(j => j.ClientName);
        const uniqueClients = removeDupes(clients);

        let newData = [];

        const newHeight = (uniqueClients.length * 75);

        if(newHeight <= 1000) {
          setChartHeight(1000);
        };

        if(newHeight > 1000) {
          setChartHeight(newHeight);
        };
        

        for(let i = 0; i<uniqueClients.length; i++){
            const clientJobs = selectedJobs.filter(j => j.ClientName === uniqueClients[i]);
            const clientStamps = timeStamps.filter(t => t.ClientName === uniqueClients[i] && t.JobTitle === accProd.jName);
            const allDurationArray = clientStamps.map(t => t.Duration);
            const allDurationRemoveNaN = allDurationArray.filter(item => !Number.isNaN(item));
            const totalDuration = allDurationRemoveNaN.reduce(add, 0);
            const averageDuration = ((totalDuration / clientJobs.length) /3600000);

            newData.push({x: averageDuration, y: uniqueClients[i]});

            if(i === (uniqueClients.length - 1)) {
                setData(newData);
            };
        };

    },[year]);
    

    const yearSelector = () => {

      const years = [<option key={0}>{parseInt(getYear(new Date()))}</option>];

      let currentYear = (getYear(new Date()) - 1);

      for(let i = 0; i<6; i++) {

        years.push(<option key={i+1}>{currentYear}</option>)

        currentYear = (currentYear - 1);

        if(i === 5) {
          return (years);
        };
      };
  };

    function handleChange(event) {
        const{name, value} = event.target;
    
        setYear((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };


    return (
      <div className="container-3">
        <h2 className="margin-bottom-small">Accounts Production Time</h2>
        <form>
          <div className="row">
            <div className="col-1-of-4">
              <h4 className="form__input-label">Job Year</h4>
              <select onChange={handleChange} type="number" value={year.jYear} className="selector margin-top-small margin-bottom-0" id="jYear" name="jYear" required>
                <option>Select Year</option>
                {yearSelector()}
              </select>
              </div>
              <div className="col-1-of-4">
              <h4 className="form__input-label">Job Month</h4>
              <select onChange={handleChange} type="text" value={year.jMonth} className="selector margin-top-small margin-bottom-0" id="jMonth" name="jMonth" required>
                <option>All Months</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
            <div className="col-1-of-4">
              <h4 className="form__input-label">Job Status</h4>
              <select onChange={handleChange} type="text" value={year.status} className="selector margin-top-small margin-bottom-0" id="status" name="status" required>
                <option>completed</option>
                <option>ready</option>
              </select>
            </div>
            <div className="col-1-of-4">
              <h4 className="form__input-label">Hour Ruler</h4>
              <input onChange={handleChange} type="number" value={year.hour} className="margin-top-small" id="hour" name="hour" required />
            </div>
          </div>
        </form>
        <AccountsProdHorizontalBar data={data}
          width={chartWidth}
          height={chartHeight}
          xLabel={xLabel}
          yLabel={yLabel}
          chartID="accProdChart"
          jName={accProd.jName}
          hourRuler={year.hour} />
      </div>
    )

};


export default AccountsProdChart;