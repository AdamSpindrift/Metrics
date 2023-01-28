import React, { useState, useEffect } from "react";
import HorizontalBarChart from "../Generic/HorizantalBarChart";
// State
import {useSelector} from "react-redux";
import store from "../store";
//Custom Modules
import removeDupes from "../Generic/removeDupes";


function ClientJobDuration () {

    const xLabel = "Duration (hrs)";
    const yLabel = "Clients";

    const [data, setData] = useState([
        {x: 1 , y: "Client 1"},
        {x: 3 , y: "Client 2"},
        {x: 2 , y: "Client 3"},
        
    ]);

    const allJobs = useSelector(state => state.jobs);
    const timeStamps = useSelector(state => state.allTimestamps);

    const completedJobs = allJobs.filter(j => j.Status === "completed");

    const [jobType, setJobType] = useState({
        jName: "Bookkeeping (weekly)",
    });

    const [chartHeight, setChartHeight] = useState(500);

    const [chartWidth, setChartWidth] = useState((window.innerWidth * 0.70));

    // const removeDupes = array => [... new Set(array)];

    

    
    const jobNames = completedJobs.map(j => j.Title);
    const uniqueJobNames = removeDupes(jobNames);
    
    function add(accumulator, a) {
        return accumulator + a;
      };

    useEffect(() => {
        const selectedJobs = completedJobs.filter(j => j.Title === jobType.jName);

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
            const clientStamps = timeStamps.filter(t => t.ClientName === uniqueClients[i] && t.JobTitle === jobType.jName);
            const allDurationArray = clientStamps.map(t => t.Duration);
            const allDurationRemoveNaN = allDurationArray.filter(item => !Number.isNaN(item));
            const totalDuration = allDurationRemoveNaN.reduce(add, 0);
            const averageDuration = ((totalDuration / clientJobs.length) /3600000);

            newData.push({x: averageDuration, y: uniqueClients[i]});

            if(i === (uniqueClients.length - 1)) {
                setData(newData);
            };
        };

    },[jobType]);
    

    const jobSelector = () => {
        return uniqueJobNames.map((job, i) => {
    
          return (
            <option key={i}>{job}</option>
          )
        })
    };

    function handleChange(event) {
        const{name, value} = event.target;
    
        setJobType((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };

    return (
        <div className="container-3">
            <h2 className="margin-top-small">Average Job Duration</h2>
            <form>
            <select onChange={handleChange} type="text" value={jobType.jName} className="selector selector--large margin-top-small margin-bottom-0" id="jName" name="jName" required>
                <option>Select Job</option>
                {jobSelector()}
            </select>
          </form>
            <HorizontalBarChart data={data} 
            width={chartWidth} 
            height={chartHeight}
            xLabel={xLabel}
            yLabel={yLabel}
            chartID="averageJobDuration"
            jName={jobType.jName} />
        </div>
    )

};


export default ClientJobDuration;