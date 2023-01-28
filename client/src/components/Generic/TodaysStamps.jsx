import React, { useState, useEffect } from "react";
import axios from "axios";
import { differenceInBusinessDays, getMonth, getYear, isWeekend, getWeekOfMonth } from "date-fns";
import { navigate } from "hookrouter";
// State
import { useSelector, useDispatch} from "react-redux";
import { dayComplete } from "../actions/dayComplete";
import { setCurrentStamp } from "../actions/setCurrentStamp";
import store from "../store";
// Generic Modules
import msToTime from "../Generic/msToTime";

function TodaysStamps (props) {

    const todayStamps = useSelector(state => state.todayStamps);
    const user = useSelector(state => state.user);
    const userName = user.fName + " " + user.lName;
    const company = useSelector(state => state.company);
    const isDayComplete = useSelector(state => state.dayComplete);
    const allTimestamps = useSelector(state => state.allTimestamps);
    const userContractDays = parseFloat(user.workingDaysWeek);
    const userContractHours = parseFloat(user.workingHoursDay);
    const dispatch = useDispatch();

    function add(accumulator, a) {
        return accumulator + a;
    };

    let businessDaysCalc = 0;
    const month = getMonth(new Date());
    const year = getYear(new Date());
    const firstDay = new Date(year, month, 1);
    const today = new Date();
    let weekOfMonth = getWeekOfMonth(new Date());
    let subDays = 0;

    if(weekOfMonth > 4) {
        weekOfMonth = 4;
    };


    if(userContractDays !== 5){
        subDays = (5 - userContractDays) * weekOfMonth;
    };

    

    if(isWeekend(new Date())) {
        businessDaysCalc = differenceInBusinessDays(today, firstDay) - subDays;
        
    } else {
        businessDaysCalc = (differenceInBusinessDays(today, firstDay)+1) - subDays;
    };
    


    const [holiday, setHoliday] = useState(0);
    const [businessDays, setBusinessDays] = useState(businessDaysCalc);

    const allUserStamps = allTimestamps.filter(t => t.EmployeeName === userName);
    const thisMonthsStamps = allUserStamps.filter(t => new Date(t.StartTime) >= firstDay);
    const allDurations = thisMonthsStamps.map(t => t.Duration);
    const [completedMs, setCompletedMs] = useState(allDurations.reduce(add, 0));
    const [differenceMs, setDifferenceMs] = useState(0);
    const [expectedMs, setExpectedMs] = useState(0);

    


    let totalMs = 0;

    const userDetails = {
        user: user,
        company: company,
    };

    for (let i = 0; i < todayStamps.length; i++) {

        if(todayStamps[i] !== null) {
            const duration = todayStamps[i].Duration;

            if(duration !== null) {
                totalMs = (totalMs + duration);
            };
        };
        
    };


    useEffect(() => {

        const newDuration = (completedMs + props.duration);

        if(props.duration !== 0) {
            setCompletedMs(newDuration);
            setDifferenceMs(newDuration - expectedMs);
        };

        

    },[props.duration]);

    


    useEffect(() => {

        const expectedHours = (businessDays * userContractHours);
        setExpectedMs(expectedHours * 3600000);
        const expected = expectedHours * 3600000;
        setDifferenceMs(completedMs - expected);
        

    },[businessDays]);
    

    


    function handleDayComplete(event) {
        event.preventDefault();

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/daycomplete", {userDetails})
            .then(res => {
                console.log(res.data.message);
                store.dispatch(dayComplete());
            });

    };



    function selectStamp (e) {
        e.preventDefault();
        const selectedStamp = e.currentTarget.getAttribute("data-item");
        store.dispatch(setCurrentStamp(selectedStamp));
        navigate("/editstamp2");
    };



    const handlePlusHoliday = (event) => {
        event.preventDefault();

        const newHoliday = holiday + 1;
        const newBusinessDays = businessDays - 1;

        setHoliday(newHoliday);
        setBusinessDays(newBusinessDays);
    };


    
    const handleSubHoliday = (event) => {
        event.preventDefault();

        const newHoliday = holiday - 1;
        const newBusinessDays = businessDays + 1;

        setHoliday(newHoliday);
        setBusinessDays(newBusinessDays);
    };


    return (
        <div className="">

            <div className="todays-stamps">
                <h3 className="todays-stamps__heading-primary">Todays Times</h3>
            

                <table id="timetable" className="todays-stamps__table">

                
                <tbody>
                        {todayStamps.map((item, i) => (
                            
                        <tr  key={i} data-item={item._id} className="table-lines-3 table__select-row--1" onClick={selectStamp}>
                            <td className="todays-stamps__table-row table-lines-3">{item.ClientName}</td>
                            <td className="todays-stamps__table-row table-lines-3">{item.JobTitle}</td>
                            <td className="todays-stamps__table-row table-lines-3">{item.Description}</td>
                            {item.Duration !== null ? <td className="todays-stamps__table-row table-lines-3">{msToTime(item.Duration)}</td> : <td>&nbsp;</td>}
                            
                            
                        </tr>
                        ))}
                </tbody>
                

                </table>

                <div className="todays-stamps__total-time">
                    <h3 className="todays-stamps__heading-secondary">Total Time</h3>
                    <h3 className="todays-stamps__heading-secondary">{msToTime(totalMs)}</h3>
                </div>

                {isDayComplete ? <div>&nbsp;</div> : <form onSubmit={handleDayComplete}>
                    <button className="main-button" type="submit">Day Complete</button>
                </form>}

                <br></br>

                <h4>Monthly Summary</h4>

                <div className="todays-stamps__monthly-summary">

                    <div className="todays-stamps__monthly-summary--box1">
                        <h5 className="">Expected to Date</h5>
                        <h5 className="todays-stamps__monthly-summary--time">{msToTime(expectedMs)}</h5>
                    </div>

                    <div className="todays-stamps__monthly-summary--box2">
                        <h5 className="">Time to Date</h5>
                        <h5 className="todays-stamps__monthly-summary--time">{msToTime(completedMs)}</h5>
                    </div>

                
                    <div className="todays-stamps__monthly-summary--box3">
                        <h5 className="">Time Difference</h5>
                        {Math.sign(differenceMs) === 1 ? <h5 className="table-pos-value todays-stamps__monthly-summary--time">{msToTime(differenceMs)}</h5> : <h5 className="table-neg-value todays-stamps__monthly-summary--time">{msToTime(differenceMs)}</h5>}
                    </div>

                    <div className="todays-stamps__total-time--holiday todays-stamps__total-time--holiday-grid todays-stamps__monthly-summary--box4">

                        <h5 className="todays-stamps__holiday-title">Holiday: {holiday} Days</h5>

                        <form onSubmit={handlePlusHoliday}>
                            <button className="todays-stamps__holiday todays-stamps__holiday--plus" type="submit">+</button>
                        </form>

                        <form onSubmit={handleSubHoliday}>
                            <button className="todays-stamps__holiday todays-stamps__holiday--neg" type="submit">-</button>
                        </form>

                    </div>
                </div>

                <h6>NB. Expected to Date counts Monday - Friday, you need to add holiday for National holidays as well as annual leave.</h6>

                

            </div>

            
            
        </div>
    );
};

export default TodaysStamps;