import React, { useEffect } from "react";
import * as d3 from "d3";
import { path } from "d3";

function LineChart(props) {
    const { data, width, height } = props;

    

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

        const [firstSeries] = data; 

        const {series : firstSeriesName , values : firstValues} = firstSeries;

        const xDataLength = (firstValues.length - 1);

        const margin = { top: 20, right: 150, bottom: 100, left: 150};

        const x = d3.scaleLinear()
                    .range([0, width]);

        const y = d3.scaleLinear()
                    .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisBottom(x).ticks((xDataLength + 1));

        const yAxis = d3.axisLeft(y).ticks(10);

        let line = d3.line()
            .x(d => x(d.week))
            .y(d => y(d.jobs))

        const svg = d3.select("#container")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);


        color.domain(data.map(function (d) { return d.series;}));

        x.domain(d3.extent(firstValues, function (d) {
            return d.week
        }));

        const valueMax = d3.max(firstValues, r => r.jobs);
        y.domain([0, valueMax]);

        // Drawing X Axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .append("text")
                .attr("class", "axis-text")
                .attr("transform", `rotate(0) translate(1300,25)`)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Week");

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
                .text("Jobs");

       
        // Drawing Lines
        const lines = svg.selectAll("lines")
                        .data(data)
                        .enter()
                        .append("g");


        lines.append("path")
                .attr("class", "line")
                .attr("id", d => d.series)
                .attr("visible", 1)
                .attr("d", function (d) {return line(d.values)})
                .style("stroke", d => color(d.series));
        
        // Series Labels
        lines.append("text")
                .attr("class", "serie-label")
                .datum(function (d) {
                    return {
                        id: d.series,
                        value: d.values[(d.values.length-1)]
                    };
                })
                .attr("transform", function (d) {
                    const position = d.value;
                   
                    return "translate(" + (x (position.week)) + "," + (y (position.jobs)) + ")";
                })
                .attr("x", 5)
                .text(function (d) { return d.id; });

        // Targets
        lines.append("path")
                .attr("class", "line")
                .attr("id", d => d.targets)
                .attr("visible", 1)
                .attr("d", function (d) {return line(d.values)})
                .style("stroke", d => color(d.series));

        
    };

    return <div id="container" />;
};

export default LineChart;