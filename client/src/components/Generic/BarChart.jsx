import React, { useEffect } from "react";
import * as d3 from "d3";
import { path } from "d3";

function BarChart(props) {
    const { data, width, height, xLabel, yLabel } = props;

    

        useEffect(() => {

            setTimeout(() => {
                drawChart();
            }, 100);
            
        }, [data]);
        
   
    

    function drawChart () {

        //Remove old Chart
        d3.select("#container")
            .select("svg")
            .remove();

        d3.select("#container")
            .select("tooltip")
            .remove();

        if (data.length < 2){
            return;
        };

        // const [firstSeries] = data; 

        // const {series : firstSeriesName , values : firstValues} = firstSeries;

        const xDataLength = (data.length - 1);

        const margin = { top: 20, right: 150, bottom: 300, left: 150};

        // const x = d3.scaleLinear()
        //             .range([0, width]);

        const x = d3.scaleBand();

        const x0 = d3.scaleBand()
                    .domain(data.map(d => d.x))
                    .rangeRound([margin.left, width - margin.right])
                    .paddingInner(0.1);

        const x1 = d3.scaleBand()
                    .domain(data.map(d => d.x))
                    .rangeRound([0, x0.bandwidth()])
                    .padding(0.05);

        const y = d3.scaleLinear()
                    .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisBottom(x).ticks((data.length + 1));

        const xLabels = data.map(d => d.x);

        const yAxis = d3.axisLeft(y).ticks(10);

        const svg = d3.select("#container")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);


        color.domain(data.map(function (d) { return d.x;}));

        x.domain(xLabels)
            .range([0, width - margin.right])
            .padding(0.1);

        const valueMax = d3.max(data, r => r.y);
        y.domain([0, valueMax]);

        // Drawing X Axis
        svg.append("g")
            .attr("className", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", `rotate(-45) translate(-10, 0)`)
            .style("text-anchor", "end");
        
        svg.append("text")
                .attr("className", "axis-text")
                .attr("transform", `rotate(0) translate(1500, 525)`)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(xLabel);


        // Drawing Y Axis
        svg.append("g")
            .attr("className", "y-axis")
            .call(yAxis)
            .append("text")
                .attr("className", "axis-text")
                .attr("transform", `rotate(0) translate(-40,0)`)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yLabel)
                .attr("transform", `rotate(-90) translate(0,-100)`);


        // Drawing Bars

        const barWidth = (width/data.length) - (((width/data.length)/100)*50);

        const xScaleBars = d3.scaleBand()
                            .range([0, width])
                            .domain(xLabels)
                            .padding(0.1);

        const yScaleBars = d3.scaleLinear()
                            .range([height, 0])
                            .domain(0, valueMax);

        const bars = svg.selectAll()
                        .data(data)
                        .enter()
                        .append("g");

        bars.append("rect")
            .attr("id", d => d.x)
            .attr("className", "chart-box")
            .attr("visible", 1)
            .attr("x", d => x(d.x)+25)
            .attr("y", d => y(d.y))
            .attr("height", (d, i) => height - y(d.y)) 
            .attr("width", barWidth);
    };

    return <div id="container" />;
};

export default BarChart;