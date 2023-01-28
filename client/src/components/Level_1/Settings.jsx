import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { CSVLink, CSVDownload } from "react-csv";
import { sub, endOfMonth, format, endOfWeek, startOfWeek, addDays } from "date-fns"
// State
import {useSelector, useDispatch} from "react-redux";
import {login} from "../actions/login";
import {setUserName} from "../actions/setusername";
import {setCompany} from "../actions/setcompany";
import {setEmployees} from "../actions/setemployees";
import {logout} from "../actions/logout";
import { setLoading } from "../actions/setLoading";
import { setLoadingDone } from "../actions/setLoadingDone";
import { setClients } from "../actions/setClients";
import { setLogo } from "../actions/setLogo";
import { setJobs } from "../actions/setjobs";
import { setTeams } from "../actions/setTeams";
import store from "../store";
// Crypto
import cryptojs from "crypto-js";
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { v4 as uuidv4 } from "uuid";
// Custom Modules
import Header from "../Generic/Header";
import SettingsNav from "../Generic/SettingsNav";
import PleaseLogin from "../Generic/PleaseLogin";
import Loading from "../Generic/Loading";
import UpdateSuccessMessage from "../Generic/UpdateSuccessMessage";
import { set } from "date-fns";
require("dotenv").config()

function Settings () {

    const userName = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let employees = useSelector(state => state.employees);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();
    const clientId = process.env.REACT_APP_XERO_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_XERO_REDIRECT_URI;
    const clientSecret = "";
    const scopes = "offline_access openid profile email accounting.transactions accounting.budgets.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings";
    
    const state = process.env.REACT_APP_XERO_STATE + "_" + company;

    const [companyDetails, setCompany] = useState({
        name: company,
        logo: "",
        application: "",
        AHR: "",
        SentaAPIKey: "",
        ClientListActive: "",
        ClientListFormer: "",
        logo: null,
        codeVerifier: "",
        month: "",
        Teams:[],
        newTeam: "",
        taskStart: format(addDays(startOfWeek(new Date),1),"dd/MM/yyyy"),
        taskEnd: format(endOfWeek(new Date,{weekStartsOn: 1}),"dd/MM/yyyy"),
      });

    const [clientList, setClientList] = useState({
        current: "",
        former: "",
    });

    const [updateComplete, setUpdate] = useState(false);

    const [loading, setLoading] = useState(true);

    const [image, setImage] = useState("");

    const [data1, setData1] = useState([]);

    const [transactionsCSV, setTransactionsCSV] = useState("");

    const [taskCSV, setTaskCSV] = useState("");

    const [fdSlaCSV, setFdSlaCSV] = useState("");
    
    
    function handleChange(event) {
        const{name, value} = event.target;
    
        setCompany((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };


    const handleXeroAPI = (event) => {
        event.preventDefault();
        setLoading(true);

        const scopes = 'offline_access openid profile email accounting.transactions accounting.budgets.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings';

        const codeVerifier = uuidv4().replace(/-/g, "");
        const authObject = {
            name: company,
            codeVerifier: codeVerifier,
        };
        const codeSHA = sha256(codeVerifier);
        const codeChallenge = Base64.stringify(codeSHA);

        let xeroURI = ""
        
        setTimeout(() => {
            axios.post(process.env.REACT_APP_SERVER_ROUTE + "xero/updatexeroauth", {authObject});
        }, 100);

        setTimeout(() => {
            xeroURI = "https://login.xero.com/identity/connect/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&scope=" + scopes + "&state="+ state;
        }, 200);

        setTimeout(() => {
            window.location.href = xeroURI;
        }, 500);
        
          
    };


    function handleAHR (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/updateahr", {companyDetails})
          .then(res => {
            setLoading(false);
            navigate("/settings");
            setUpdate(true);
            setTimeout(() => {
                setUpdate(false);
            }, 1900);
          });

    };

    function handleSentaAPI (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/usenta189", {companyDetails})
          .then(res => {
            setLoading(false);
            navigate("/settings");
            setUpdate(true);
            setTimeout(() => {
                setUpdate(false);
            }, 1900);
          });

    };

    function handleClientListActive (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/clientlist", {companyDetails})
          .then(res => {
            setClientList({
                current: res.data.activeList,
                former: res.data.formerList,
            });
            setLoading(false);
            navigate("/settings");
            setUpdate(true);
            setTimeout(() => {
                setUpdate(false);
            }, 1900);
          });

    };

    function handleClientListFormer (event) {
        event.preventDefault();
        setLoading(true);
        
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/formerclientlist", {companyDetails})
          .then(res => {
            setClientList({
                current: res.data.activeList,
                former: res.data.formerList,
            });
            setLoading(false);
            navigate("/settings");
            setUpdate(true);
            setTimeout(() => {
                setUpdate(false);
            }, 1900);
          });

    };


    // Company Details

    useEffect(() => {

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/getcompany", {companyDetails})
          .then(res => {
              const companyRes = res.data.company;
              setLoading(false);
              
            setClientList({
                current: companyRes.ClientListActive,
                former: companyRes.ClientListFormer,
            });
            setCompany ({
                name: company,
                application: companyRes.Application,
                AHR: companyRes.AHR,
                ClientListActive: companyRes.ClientListActive,
                ClientListFormer: companyRes.ClientListFormer,
                Teams: companyRes.Teams,
            });
          });

    },[]);

    const handleGetClients = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/getsentaclients", {companyDetails})
            .then(res => {

                if(res.data.clients != undefined) {
                    store.dispatch(setClients(res.data.clients));
                };
                
                console.log(res.data.message);
                setLoading(false);
                navigate("/settings");
            });
    };


    const handleGetJobs = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/getsentajobs", {companyDetails})
            .then(res => {
                store.dispatch(setJobs(res.data.jobs));
                console.log(res.data.message);
                setLoading(false);
                navigate("/settings");
            });
    };

    const handleSetupBudgets = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "uapi/setupnewbudgets", {companyDetails})
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };

    const handleUploadImage = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        await formData.append("file", image);
        await formData.append("name", companyDetails.name);
        await formData.append("company", companyDetails.name);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/addlogo", formData, config)
            .then(res => {
                store.dispatch(setLogo(res.data.logo));
                console.log(res.data.logo);
                navigate("/settings");
            });
    };

    const fileChange = (event) => {
        setImage(event.target.files[0]);
    };

    const asyncTransactionTemplate = () => {

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/sendtransactiontemplate", {companyDetails})
            .then(res => {
                
                setData1(res.data.transactionTemplate);
                console.log("Transaction Template Downloaded");

            });
        
      };
      

    const templateHeaders = [{label: "ClientID", key: "clientId"},
      {label: "ClientName", key: "clientName"},
      {label: "BankTransactions", key: "bankTransactions"},
      {label: "TellerooTransactions", key: "tellerooTransactions"},
      {label: "TellerooPayment Runs", key: "tellerooPaymentRuns"}];



    const handleUploadCSV = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData();
        await formData.append("file", transactionsCSV);
        await formData.append("company", companyDetails.name);
        await formData.append("month", companyDetails.month);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/uploadtransactions", formData, config)
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };


    const handleUploadTaskCSV = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData();
        await formData.append("file", taskCSV);
        await formData.append("company", companyDetails.name);
        await formData.append("start", companyDetails.taskStart);
        await formData.append("end", companyDetails.taskEnd);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/uploadtasks", formData, config)
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };


    const handleUploadFdSlaCSV = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData();
        await formData.append("file", fdSlaCSV);
        await formData.append("company", companyDetails.name);
        await formData.append("start", companyDetails.taskStart);
        await formData.append("end", companyDetails.taskEnd);

        const config = {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/uploadfdsla", formData, config)
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };

    const fileChangeCSV = (event) => {
        setTransactionsCSV(event.target.files[0]);
    };

    const fileChangeCSVTask = (event) => {
        setTaskCSV(event.target.files[0]);
    };

    const fileChangeFdSla = (event) => {
        setFdSlaCSV(event.target.files[0]);
    };

    const handleAddTeam = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "uapi/addteam", {companyDetails})
            .then(res => {
                store.dispatch(setTeams(res.data.teams));
                setLoading(false);
                navigate("/dashboard");
            });
    };

    const monthSelector = () => {
        const months = [
            format(endOfMonth(new Date),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 1})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 2})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 3})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 4})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 5})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 6})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 7})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 8})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 9})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 10})),"dd/MM/yyyy"),
            format(endOfMonth(sub(new Date,{months: 11})),"dd/MM/yyyy"),
        ];


        return months.map((m, i) => {
    
            return (
              <option key={i}>{m}</option>
            )
          });
    };

    const taskStartSelector = () => {
        const startWeek = [
            format(addDays(startOfWeek(new Date),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 1})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 2})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 3})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 4})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 5})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 6})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 7})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 8})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 9})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 10})),1),"dd/MM/yyyy"),
            format(addDays(startOfWeek(sub(new Date,{weeks: 11})),1),"dd/MM/yyyy"),
        ];


        return startWeek.map((m, i) => {
    
            return (
              <option key={i}>{m}</option>
            )
          });
    };

    const taskEndSelector = () => {
        const endWeek = [
            format(endOfWeek(new Date,{weekStartsOn: 1}),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 1}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 2}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 3}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 4}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 5}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 6}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 7}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 8}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 9}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 10}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 11}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
        ];


        return endWeek.map((m, i) => {
    
            return (
              <option key={i}>{m}</option>
            )
          });
    };

    const teamsMapper = (teams) => {
        return teams.map((t, i) => {
            return(
                <h4 key={i}>{t}</h4>
            )
        });
    };
    

    if (isLoggedIn === true) {

        return (
            <div className="container-2">
                <Header title="Settings"/>
                {updateComplete ? <UpdateSuccessMessage message="Update Complete" /> : <div className="nbsp">&nbsp;</div>}
                <SettingsNav />

                <div className="settings__details">
                    <div className="settings__details__text float-left">
                        <h3>Company Name:</h3>
                        <h3>Application:</h3>
                        <h3>Target AHR:</h3>
                        <h3>Client List Active:</h3>
                        <h3>Client List Former:</h3>
                    </div>
                    <div className="settings__details__text">
                        <h3>{companyDetails.name}</h3>
                        {companyDetails.application === null || undefined ? <h3>Not Set</h3> : <h3>{companyDetails.application}</h3>}
                        {companyDetails.AHR === null || undefined ? <h3>Not Set</h3> : <h3>{companyDetails.AHR}</h3>}
                        {companyDetails.ClientListActive === null || undefined ? <h3>Not Set</h3> : <h3>{clientList.current}</h3>}
                        {companyDetails.ClientListFormer === null || undefined ? <h3>Not Set</h3> : <h3>{clientList.former}</h3>}
                    </div>
                </div>

                <div className="row settings__form1">
                    <div className="col-1-of-4">
                        <h4 className="form__input-label">Target AHR</h4>
                        <form onSubmit={handleAHR}>
                            <input onChange={handleChange} type="text" value={companyDetails.AHR} name="AHR" placeholder="Average Hourly Rate"/>
                            <button className="main-button main-button--large" type="submit">Submit</button>
                        </form>
                    </div>

                    <div className="col-1-of-4">
                        <h4 className="form__input-label">Senta API Key</h4>
                        <form onSubmit={handleSentaAPI}>
                            <input onChange={handleChange} type="text" value={companyDetails.SentaAPIKey} name="SentaAPIKey" placeholder="Senta API Key"/>
                            <button className="main-button main-button--large" type="submit">Submit</button>
                        </form>
                    </div>

                    <div className="col-1-of-4">
                        <h4 className="form__input-label">Active Client List</h4>
                        <form onSubmit={handleClientListActive}>
                            <input onChange={handleChange} type="text" value={companyDetails.ClientListActive} name="ClientListActive" placeholder="Active Client List"/>
                            <button className="main-button main-button--large" type="submit">Submit</button>
                        </form>
                    </div>

                    <div className="col-1-of-4">
                        <h4 className="form__input-label">Former Client List</h4>
                        <form onSubmit={handleClientListFormer}>
                            <input onChange={handleChange} type="text" value={companyDetails.ClientListFormer} name="ClientListFormer" placeholder="Former Client List"/>
                            <button className="main-button main-button--large" type="submit">Submit</button>
                        </form>
                    </div>

                </div>
                

                <div className="row">
                    <div className="col-1-of-2">
                        <div className="settings__setup">

                            <h2>Initial Setup</h2>

                            <div>
                                <form onSubmit={handleGetClients}>
                                    <button className="main-button main-button--large" type ="submit">Get Clients</button>
                                </form>
                            </div>

                            {/* <div>
                                <form onSubmit={handleSetupBudgets}>
                                    <button className="main-button main-button--large" type ="submit">Setup Budgets</button>
                                </form>
                            </div> */}

                            <div>
                                <form onSubmit={handleGetJobs}>
                                    <button className="main-button main-button--large" type ="submit">Get Jobs</button>
                                </form>
                            </div>

                            {/* <div>
                                <form onSubmit={handleCalcAHR}>
                                    <button className="main-button main-button--large" type ="submit">Calculate AHR</button>
                                </form>
                            </div> */}

                            {/* <div>
                                <form onSubmit={handleDeleteJobs}>
                                    <button className="main-button main-button--large" type ="submit">Delete All Jobs</button>
                                </form>
                            </div>
                            
                            <div>
                                <form onSubmit={handleDeleteClients}>
                                    <button className="main-button main-button--large" type ="submit">Delete All Clients</button>
                                </form>
                            </div> */}

                        </div>
                    </div>

                    <div className="col-1-of-2">

                        {company === "djca" ? 
                        <form onSubmit={handleXeroAPI}>
                            <button className="main-button main-button--large main-button--xero" type ="submit"><img src="https://metricsuploads.s3.eu-west-2.amazonaws.com/Xero-Connect-Buttons/connect-blue.svg" alt="Xero Connect" className="xero-connect"></img></button>
                        </form>

                        :

                        <div></div>}



                        <h3 className="margin-top-large">Branding</h3>
                        <h4 className="form__logo-specs">Please ensure logo file type is png and resolution 500x280, max file size 500k.</h4>
                        <form onSubmit={handleUploadImage}>
                            <input onChange={fileChange} type="file" className="form__file" id="logo" name="logo" required></input>
                            <button className="main-button main-button--large" type ="submit">Upload Logo</button>
                        </form>
                    </div>

                </div>

                <div className="transactions">
                    <h2 className="margin-top-large">Transactions</h2>

                    <CSVLink data={data1}  headers={templateHeaders} asyncOnClick={true} onClick={asyncTransactionTemplate} filename={"Transaction_Template.csv"} className="main-button main-button--large-2 margin-bottom-medium">Download Transaction Template</CSVLink>

                    <h3>Select Transaction Month</h3>
                        <select onChange={handleChange} type="text" value={companyDetails.month} className="selector" id="month" name="month" required>
                            {monthSelector()}
                        </select>

                    <form onSubmit={handleUploadCSV}>
                        <input onChange={fileChangeCSV} type="file" className="form__file" id="csv" name="csv" required></input>
                        <button className="main-button main-button--large" type ="submit">Upload CSV</button>
                    </form>

                </div>

                <div className="settings__teams">
                    <h2 className="margin-top-large margin-bottom-small">Teams</h2>
                    {companyDetails.Teams.length > 0 ? teamsMapper(companyDetails.Teams) : <h4>No Teams Defined</h4>}
                    
                    <form className="margin-top-small" onSubmit={handleAddTeam}>
                        <h4>Input name to add Team</h4>
                        <input onChange={handleChange} type="text" value={companyDetails.newTeam} className="" id="newTeam" name="newTeam" placeholder="Team Name" required></input>
                        <button className="main-button main-button--large" type ="submit">Add Team</button>
                    </form>

                </div>

                <div className="settings__tasks">
                    <h2 className="margin-top-large margin-bottom-small">Upload Task Analysis CSV</h2>

                    <form onSubmit={handleUploadTaskCSV}>
                        <h3 className="margin-top-large margin-bottom-small">Start of Week</h3>
                        <select onChange={handleChange} type="text" value={companyDetails.taskStart} className="selector" id="taskStart" name="taskStart" required>
                            {taskStartSelector()}
                        </select>
                        <h3 className="margin-top-large margin-bottom-small">End Of Week</h3>
                        <select onChange={handleChange} type="text" value={companyDetails.taskEnd} className="selector" id="taskEnd" name="taskEnd" required>
                            {taskEndSelector()}
                        </select>
                        <br></br>
                        <input onChange={fileChangeCSVTask} type="file" className="form__file" id="csv" name="csv" required></input>
                        <button className="main-button main-button--large" type ="submit">Upload CSV</button>
                    </form>

                </div>

                <div className="settings__fdsla">
                    <h2 className="margin-top-large margin-bottom-small">Upload Freshdesk SLA Analysis CSV</h2>

                    <form onSubmit={handleUploadFdSlaCSV }>
                        <h3 className="margin-top-large margin-bottom-small">Start of Week</h3>
                        <select onChange={handleChange} type="text" value={companyDetails.taskStart} className="selector" id="taskStart" name="taskStart" required>
                            {taskStartSelector()}
                        </select>
                        <h3 className="margin-top-large margin-bottom-small">End Of Week</h3>
                        <select onChange={handleChange} type="text" value={companyDetails.taskEnd} className="selector" id="taskEnd" name="taskEnd" required>
                            {taskEndSelector()}
                        </select>
                        <br></br>
                        <input onChange={fileChangeFdSla} type="file" className="form__file" id="csv" name="csv" required></input>
                        <button className="main-button main-button--large" type ="submit">Upload CSV</button>
                    </form>

                </div>

                {loading === true ? <Loading /> : <div>&nbsp;</div>}
                 
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    };
};


export default Settings;