var app = angular.module('story', []);
app.controller('myCtrl', function ($scope) {

    $scope.selectTrigger = function (sceneId) {
        //clear existing content
        d3.select("svg").html("");

        //set the appropriate button class as selected
        d3.selectAll(".btnTrigger").classed("depressed", false);
        if (sceneId == "scene1") {
            d3.select("#btnScene1").classed("depressed", true);
        }
        else if (sceneId == "scene2") {
            d3.select("#btnScene2").classed("depressed", true);
        }
        else {
            d3.select("#btnScene3").classed("depressed", true);
        }

        //hide the left hand description of other scenes
        d3.selectAll(".columnLeft div").classed("noShow", true);
        d3.selectAll("#" + sceneId).classed("noShow", false);

        //draw the chart and
        //change the graph to show progress till that scene
        $scope.drawChart(sceneId);
        $scope.addAnnotations();
    }

    $scope.drawChart = function (sceneId) {
        var margin = { top: 50, right: 50, bottom: 50, left: 50 }
            , width = 650 
            , height = 475; 

        //n = 15

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var xScale = d3.scaleLinear()
            .domain([2005, 2019]) // input
            .range([0, width]); // output

        var yScale = d3.scaleLinear()
            .domain([0, 2400]) // input 
            .range([height, 0]); // output

        var line = d3.line()
            .x(function (d, i) { return xScale(d.year); }) // set the x values for the line generator
            .y(function (d, i) { return yScale(d.count); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        $scope.annotationsBase = [
            {
                note: {
                    label: "Watch Now launched",
                    title: "",
                    align: "middle"
                },
                x: xScale(2007)+20,
                y: yScale(title_counts['2007']) - 20,
                dy: -100,
                dx: 100
            },
            {
                note: {
                    label: "House of cards produced",
                    title: "",
                    align: "middle"
                },
                x: xScale(2012) + 20,
                y: yScale(title_counts['2012']) - 20,
                dy: -100,
                dx: 100
            },
            {
                note: {
                    label: "Subscribers surpass all cable companies combined, in the US",
                    title: "",
                    align: "middle",
                    wrap: 250
                },
                x: xScale(2017) + 20,
                y: yScale(title_counts['2017']) - 20,
                dy: -100,
                dx: -100
            }
        ]

        var data = [];
        $scope.annotations = [];
        if (sceneId == "scene1") {
            $scope.annotations = $scope.annotationsBase.slice(0, 1);
            data = parseData(title_counts, user_counts, '2007');
        }
        else if (sceneId == "scene2") {
            $scope.annotations = $scope.annotationsBase.slice(0, 2);
            data = parseData(title_counts, user_counts, '2012');
        }
        else {
            $scope.annotations = $scope.annotationsBase.slice(0, 3);
            data = parseData(title_counts, user_counts, '2019');
        }

        svg = d3.select("svg")
            .attr("height", height + 100)
            .attr("width", "95%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(20," + (height-20) + ")")
            .text("Year")
            .call(d3.axisBottom(xScale)); 

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(20," + (-20) + ")")
            .call(d3.axisLeft(yScale)); 

        svg.append("path")
            .attr("transform", "translate(20," + (-20) + ")")
            .datum(data) // 10. Binds data to the line 
            .attr("class", "line") // Assign a class for styling 
            .attr("d", line); // 11. Calls the line generator 

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("transform", "translate(20," + (-20) + ")")// Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d, i) { return xScale(d.year) })
            .attr("cy", function (d) { return yScale(d.count) })
            .attr("r", 2)
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Subscribers (M)" + "<br/>" + d.user_count)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("text")
            .attr("transform", "translate(" + width/2 + "," + (height + 15) + ")")
            .text("Year");

        svg.append("text")
            .attr("transform", "translate(-20," + (height - 200) + ")rotate(-90)")
            .text("Titles added");
    }

    $scope.addAnnotations = function () {
        const makeAnnotations = d3.annotation().annotations($scope.annotations)
        d3.select("g")
            .append("g")
            .call(makeAnnotations)
    }

    $scope.selectTrigger('scene1');
});

var title_counts =
{
    "2005": 0,
    "2006": 0,
    "2007": 0,
    "2008": 2,
    "2009": 2,
    "2010": 1,
    "2011": 13,
    "2012": 7,
    "2013": 12,
    "2014": 25,
    "2015": 90,
    "2016": 456,
    "2017": 1300,
    "2018": 1782,
    "2019": 2349
}

var user_counts = {
    "2005": 2.5,
    "2006": 4,
    "2007": 7.3,
    "2008": 9.4,
    "2009": 11.9,
    "2010": 18.3,
    "2011": 21.6,
    "2012": 25,
    "2013": 45,
    "2014": 65,
    "2015": 85,
    "2016": 105,
    "2017": 125,
    "2018": 145,
    "2019": 165,
}

function parseData(inDict, userDict, tillYear) {
    var arr = [];
    for (var i in inDict) {
        a = {
            'year': i, 'count': inDict[i], 'user_count': userDict[i]
        };
        arr.push(a)
        if (i == tillYear) {
            break;
        }
    }
    return arr
}
