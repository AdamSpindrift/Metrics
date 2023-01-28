import React, { useEffect } from "react";
import * as d3 from "d3";
import { path } from "d3";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
//Custom Modules
import removeDupes from "./removeDupes";

function AccountsProdHorizontalBar(props) {
    const { data, width, height, xLabel, yLabel, chartID, jName, hourRuler } = props;

    const allTimestamps = useSelector(state => state.allTimestamps);
    const jobTimestamps = allTimestamps.filter(t => t.JobTitle === jName);
    const clients = data.map(d => d.y);
    let clientEmployees = [];

    for(let i = 0; i<clients.length; i++) {

        const stamps = jobTimestamps.filter(s => s.ClientName === clients[i]);
        const employees = stamps.map(s => s.EmployeeName);
        const uniqueEmployees = removeDupes(employees);

        const newObject = {
            clientName: clients[i],
            employees: uniqueEmployees,
        };

        clientEmployees.push(newObject);

    };

    

        useEffect(() => {

            setTimeout(() => {
                drawChart(clientEmployees);
            }, 100);
            
        }, [data]);
        
   
    

    function drawChart (clientE) {


        //Remove old Chart
        d3.select("#" + chartID)
            .select("svg")
            .remove();

        d3.select("#" + chartID)
            .select("#tooltip")
            .remove();

        if (data.length < 2){
            return;
        };

        
        const clientEmployees2 = clientE;

        const margin = { top: 100, right: 150, bottom: 300, left: 300};

        

        const y = d3.scaleBand();

        const y0 = d3.scaleBand()
                    .domain(data.map(d => d.y))
                    .rangeRound([margin.top, height - margin.bottom])
                    .paddingInner(0.1);

        const y1 = d3.scaleBand()
                    .domain(data.map(d => d.y))
                    .rangeRound([0, y0.bandwidth()])
                    .padding(0.05);

        const x = d3.scaleLinear()
                    .range([width, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisTop(x).ticks(10);

        const yLabels = data.map(d => d.y);

        const yAxis = d3.axisLeft(y).ticks((data.length + 1));

        const svg = d3.select("#" + chartID)
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("class", chartID + "__main-svg")
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);


        color.domain(data.map(function (d) { return d.x;}));

        y.domain(yLabels)
            .range([0, height - margin.bottom])
            .padding(0.1);

        const xValues = data.map(d => d.x);
        const valueMax = d3.max(xValues);
        x.domain([valueMax, 0]);

        // Drawing X Axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, 0)`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", `rotate(0) translate(10,-5)`)
            .style("text-anchor", "end");
        
        svg.append("text")
                .attr("class", "axis-text")
                .attr("transform", `rotate(0) translate(${width}, -75)`)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(xLabel);


        // Drawing Y Axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append("text")
                .attr("class", "axis-text")
                .attr("transform", `rotate(0) translate(-40,0)`)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yLabel)
                .attr("transform", `rotate(0) translate(-50,-20)`);


        // Drawing Bars

        const barHeight = (height/data.length) - ((height/data.length)/2);

        const yScaleBars = d3.scaleBand()
                            .range([0, width])
                            .domain(yLabels)
                            .padding(0.1);

        const xScaleBars = d3.scaleLinear()
                            .range([height, 0])
                            .domain(0, valueMax);

        const bars = svg.selectAll()
                        .data(data)
                        .enter()
                        .append("g");

        const onePercentWidth = (width/100);
        const onePercentValueMax = (100 / valueMax);

        // Drawing Tool Tip

        let tooltip = d3.select("#" + chartID)
                        .append("div")
                        .attr("id", "tooltip")
                        .style("opacity", 0)
                        .attr("class", "tooltip");

        let showTooltip = function(e, d) {

            const clientObject = clientEmployees2.find(c => c.clientName === d.y);
            const employees = clientObject.employees;
            let employeeText = "";
            for(let i = 0; i<employees.length; i++) {
                employeeText = employeeText + ("<p>" + employees[i] + "</p>");
            };

            setTimeout(() => {
                tooltip
            .transition()
            .duration(100)
            .style("opacity", 1)
            tooltip
            .html("<p>" + d.y + "</p>" + employeeText + "<p>hrs - " + Math.round(d.x * 10)/10 + "</p>");    
            }, 50);
            
        };

        let moveTooltip = function(e, d) {

            const [x, y] = d3.pointer(e)
            const xAdjust = (x+200);
            const yAdjust = (y-75);
            tooltip
            .style("position", "absolute")
            .style("left", `${xAdjust}px`)
            .style("top", `${yAdjust}px`);
        };  

        let hideTooltip = function(d) {
            tooltip
            .transition()
            .duration(100)
            .style("opacity", 0)
        };

        // Append Bars

        bars.append("rect")
            .attr("id", d => d.x)
            .attr("class", "chart-box")
            .attr("visible", 1)
            .attr("x", 2)
            .attr("y", d => y(d.y)+10)
            .attr("height", barHeight) 
            .attr("width", (d, i) => (onePercentWidth * (d.x * onePercentValueMax)))
            // Show Tooltip on Hover
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)
            .on("mouseover", showTooltip);


            

        // Drawing Ruler
        
        const rulerStart = (onePercentWidth * (hourRuler * onePercentValueMax))

        const rulerLength = (height - margin.bottom);

        svg.append("line")
            .attr("x1", rulerStart)
            .attr("y1", 2)
            .attr("x2", rulerStart)
            .attr("y2", rulerLength)
            .style("stroke", "red")
            .attr("stroke-width", "4");
        

        
    };

    return <div id={chartID} className={chartID} />;
};

export default AccountsProdHorizontalBar;