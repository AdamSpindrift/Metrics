import React, { useState, useEffect } from "react";
import { getYear, getMonth, startOfYear, endOfYear, format, endOfMonth} from "date-fns";
// State
import {useSelector} from "react-redux";
import store from "../store";
//Custom Modules
import removeDupes from "./removeDupes";
import JobListFull from "./JobListFull";


function FilteredJobList () {

  const [jobType, setJobType] = useState({
    jName: "Accounts production",
    status: "completed",
    start: new Date(startOfYear(new Date())),
    end: new Date(endOfMonth(new Date())),
  });

   
    const allJobs = useSelector(state => state.jobs);
    const removeAdmin = allJobs.filter(j => j.Title !== "Admin");
    const removeMeeting = removeAdmin.filter(j => j.Title !== "Meeting");
    const removeNaN = removeMeeting.filter(j => !isNaN(j.AHR));
    const [selectedJobs, setSelectedJobs] = useState([]);
    

    const jobNames = removeMeeting.map(j => j.Title);
    const uniqueJobNames = removeDupes(jobNames);

    

    useEffect(() => {
      const completedJobs = removeNaN.filter(j => j.Status === jobType.status);
      let filteredJobs = completedJobs.filter(j => j.Title === jobType.jName);
      let filteredStart = filteredJobs.filter(j => new Date(j.Date) >= new Date(jobType.start));
      let filteredEnd = filteredStart.filter(j => new Date(j.Date) <= new Date(jobType.end));
      filteredEnd.sort((a, b) => (a.AHR < b.AHR) ? 1 : -1);
      setSelectedJobs(filteredEnd);
    }, [jobType]);


    const [year, setYear] = useState(2020);
    

    function add(accumulator, a) {
        return accumulator + a;
      };

    
    

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

    const jobSelector = () => {

      uniqueJobNames.sort();

      return uniqueJobNames.map((job, i) => {
  
        return (
          <option key={i}>{job}</option>
        )
      })
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

      function handleChange2(event) {
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
        <h2 className="margin-bottom-small">Job Profit Table</h2>
        <form>
          <div className="row">
            <div className="col-1-of-4">
              <h4 className="form__input-label">Job Name</h4>
              <select onChange={handleChange2} type="text" value={jobType.jName} className="selector selector--large margin-top-small margin-bottom-0" id="jNameID" name="jName" required>
                {jobSelector()}
              </select>
            </div>
            
            <div className="col-1-of-4">
              <h4 className="form__input-label">Job Status</h4>
              <select onChange={handleChange2} type="text" value={jobType.status} className="selector margin-top-small margin-bottom-0" id="jStatus" name="status" required>
                <option>completed</option>
                <option>ready</option>
              </select>
            </div>

            <div className="col-1-of-4">
              <h4 className="form__input-label">Start Date</h4>
              <input onChange={handleChange2} className="form__input-date margin-top-small margin-bottom-0"  type="date" id="startDate" name="start" value={format(new Date(jobType.start), "yyyy-MM-dd")}></input>
            </div>

            <div className="col-1-of-4">
                <h4 className="form__input-label">End Date</h4>
                <input onChange={handleChange2} className="form__input-date margin-top-small margin-bottom-0" type="date" id="endDate" name="end" value={format(new Date(jobType.end), "yyyy-MM-dd")}></input>
            </div>
            
          </div>
        </form>
        <JobListFull list={selectedJobs}/>
      </div>
    )

};


export default FilteredJobList;