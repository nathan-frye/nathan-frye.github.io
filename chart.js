/*Promise.all should create an array of the data files.
Access driverInfo.csv with dataset[0], raceInfo with dataset[1], etc.*/
Promise.all([
    d3.csv("driverInfo.csv"),
    d3.csv("raceInfo.csv"),
    d3.csv("results.csv"),
]).then(function(dataset)
{
    var dimensions = {
        width: 1200,
        height: 800,
        margin: {
            top: 10,
            bottom: 100,
            right: 10,
            left: 50
        }
    }

    //Need this for showing the name and other information when mousing over a line/dot
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("z-index", "10")
        .style("background-color", "#545454")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("box-shadow", "2px 2px 3px black")
        .style("text-align", "center")
        .style("justify-content", "center")
        .text("Default")

    //style for the chart
    var svg = d3.select("#chart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)


    //Group data by year (season)
    var years = d3.group(dataset[1], d=>d.year)

    //create array of just the years for the dropdown
    var yearsOnly=[];
    for(var i = 1950; i <= 2020; i++){
        yearsOnly.push(i)
    }

    var yearsRange=[];
    for(var i = 1990; i <=2020; i++){
        yearsRange.push(i)
    }

    var startYear = "1990"

    //Extract exact year (season) we're starting with
    var races = years.get("1990")

    //Group data by raceId
    var raceStandings = d3.group(dataset[2], d=>d.raceId)

    var labels = yearsRange;

    //set up x and y axis
    var xScale = d3.scaleBand()
        .domain(labels)
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        //.padding(0.2)

    //using 30 for max percent temp
    var yScale = d3.scaleLinear()
        .domain([0, 35])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    var scaleColor = d3.scaleOrdinal()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43])
        .range(['#A93226', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9', '#3498DB', '#1ABC9C', '#16A085', '#27AE60', '#28B463', 
            '#F1C40F', '#F39C12', '#E67E22', '#D35400', '#ECF0F1', '#BDC3C7', '#839192', '#34495E', '#2C3E50', '#7B241C', '#0E6251', 
            '#F7DC6F', '#C39BD3', '#808B96', '#515A5A', '#DB7093', '#4A235A', '#1B4F72', '#9A7D0A', '#7B7D7D', '#FFF8DC', '#DEB887', 
            '#BC8F8F', '#F4A460', '#DAA520', '#CD853F', '#D2691E', '#A0522D', '#2F4F4F', '#FF1493', '#90EE90', '#808000', '#7CFC00',])

    var xAxisgen = d3.axisBottom().scale(xScale)
    var yAxisgen = d3.axisLeft().scale(yScale)

    var xAxis = svg.append("g")
        .call(xAxisgen)
        .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)

    //x axis label
    svg.append("text")
        .attr("transform", "translate(" + (dimensions.width/2) + " ," + (dimensions.height + dimensions.margin.top - 70) + ")")
        .style("text-anchor", "middle")
        .text("Year (season)")

    //graph information for easier user experience
    svg.append("text")
    .attr("transform", "translate(" + (dimensions.width/2) + " ," + (dimensions.height + dimensions.margin.top - 55) + ")")
    .style("text-anchor", "middle")
    .text("*Each line (and connecting dot) in this graph represents a driver that competed in the Formula 1 racing series over some of the years shown in this graph.")

    //graph information for easier user experience 2.0
    svg.append("text")
    .attr("transform", "translate(" + (dimensions.width/2) + " ," + (dimensions.height + dimensions.margin.top - 40) + ")")
    .style("text-anchor", "middle")
    .text("You can hover your mouse over any line to highlight it and see the driver name, and hovering over a dot will reveal more information.")



    var yAxis = svg.append("g")
                .call(yAxisgen)
                .style("transform", `translateX(${dimensions.margin.left}px)`)

    //y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 5)
        .attr("x", 0 - 355)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage of Points Earned Out of Total Points")

    //Extract race info for the year (season) we're starting with
    var seasonInfo = races.flatMap(function(v){
        return raceStandings.get(v.raceId)
    })

    //Tie the driverID to the total points earned by that driver for the year (season)
    var driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)

    //Make an array of total points earned for y-axis
    var points = Array.from(driverPoints.values())

    //variable to store all the points in a year for calculating percentage later
    var totForyear = 0

    for(var i = 0; i < points.length; i++){
        totForyear += points[i];
    }

    //Map all driver info to driverId (aka surname and forename)
    var driverNames = d3.group(dataset[0], d => d.driverId)
    
    //Convert driverPoints into an array
    var temp = Array.from(driverPoints)

    //Map full driver names to their total points earned for the year (season)
    var data = temp.map(function(v){
        var d = driverNames.get(v[0])
        return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[0]}
    })

    //array to store all the dots, used later for making the connecting lines
    //notation to access cx for example dotArr[0]._groups[0][0].cx.baseVal.value
    //notation to access the name dotArr[0]._groups[0][0].attributes[4].textContent
    var dotArr = []

    var dots = svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year) + 18)
        .attr("cy", d => yScale((d.points / totForyear) * 100))
        .attr("r", 3)
        .attr("fill", d => scaleColor(d.name))
        .attr("name", d => d.name)
        .attr("name2", d=> d.points)
        .attr("name3", d => (d.points / totForyear) * 100)
        .on('mouseover', function(){
            highLight(d3.select(this), 1)
        })
        .on('mouseout', function(){
            unHighLight(d3.select(this))
        })


    dotArr.push(dots)

    //loop to create rest of dots all variables are used same as above
    for(var i = 1; i <= 30; i++){
        races = years.get(String(labels[i]))

        //Extract race info for the year (season) we're working with
        seasonInfo = races.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })
    
        driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)
        
        points = Array.from(driverPoints.values())

        totForyear = 0

        for(var k = 0; k < points.length; k++){
            totForyear += points[k];
        }
        
        driverNames = d3.group(dataset[0], d => d.driverId)
        
        temp = Array.from(driverPoints)
        
        data = temp.map(function(v){
            var d = driverNames.get(v[0])
            return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[i]}
        })
    
        dots = svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year) + 18)
            .attr("cy", d => yScale((d.points / totForyear) * 100))
            .attr("r", 3)
            .attr("fill", d => scaleColor(d.name))
            .attr("name", d => d.name)
            .attr("name2", d => d.points)
            .attr("name3", d => (d.points / totForyear) * 100)
            .on("mouseover", function(d){
                highLight(d3.select(this), 1)
            })
            .on("mouseout", function(){
                unHighLight(d3.select(this))
            })

        dotArr.push(dots)    
    }

    
    /*Adding the lines by looking at information for one year, and then comparing it to the next
      year and seeing if that driver competed between multiple years.
    */
    var sourceX = 0
    var sourceY = 0
    var targetX = 0
    var targetY = 0
    var currName = "none"
    var edge
    var lines = []

    //loop through years
    for(var i = 0; i < 30; i++){
        //loop through drivers in a year i
        for(var k = 0; k < dotArr[i]._groups[0].length; k++){

            //pull out specific name, and find it in the next year
            currName = dotArr[i]._groups[0][k].attributes[4].textContent

            //set source x and y from current driver
            sourceX = dotArr[i]._groups[0][k].cx.baseVal.value
            sourceY = dotArr[i]._groups[0][k].cy.baseVal.value

            //loop through the next year i + 1 and find the driver
            for(var j = 0; j < dotArr[i + 1]._groups[0].length; j ++){

                //find same driver if they are in that year
                if(dotArr[i + 1]._groups[0][j].attributes[4].textContent == currName){
                    
                    //set target x and y from current driver from the next year
                    targetX = dotArr[i + 1]._groups[0][j].cx.baseVal.value
                    targetY = dotArr[i + 1]._groups[0][j].cy.baseVal.value

                    //draw the line
                    //console.log(sourceX + " " + sourceY + " " + targetX + " " + targetY)
                    edge = svg.append("line")
                        .attr("stroke", scaleColor(currName)) //scaleColor(currName) use once working
                        .attr("stroke-width", 1.5)
                        .attr("x1", sourceX)
                        .attr("y1", sourceY)
                        .attr("x2", targetX)
                        .attr("y2", targetY)
                        .attr("name", currName)
                        .on('mouseover', function(){
                            highLight(d3.select(this), 0)
                        })
                        .on('mouseout', function(){
                            unHighLight(d3.select(this))
                        })

                        lines.push(edge)
                }
            }
        }
    }
        
    /*When mousing over a dot or line, use its attribute "name" to find all of the corresponding
      dots and lines and make them larger, so that the driver is more easily distinguishable throughout
      the graph.
    */
    function highLight(theName, isDot){
        //pull out the name of driver to be highlighted
        var tempName = theName._groups[0][0].attributes.name.textContent

        //display the name in the tooltip
        const[x,y] = d3.pointer(event)

        if(isDot == 1){
            var tempPoints = theName._groups[0][0].attributes.name2.textContent
            var tempPerc = theName._groups[0][0].attributes.name3.textContent
            tempPerc = tempPerc.substring(0, 4)
            tooltip
            .transition()
            .duration(200)
            .text(String(tempName) + "; Points: " + tempPoints + "; Points Percentage: " + tempPerc + "%")
            .style("opacity", 1)
            .style("left", (x + 300) + "px")
            .style("top", (y + 30) + "px")    
        }
        else if(isDot == 0){
            tooltip
            .transition()
            .duration(200)
            .text(String(tempName))
            .style("opacity", 1)
            .style("left", (x + 300) + "px")
            .style("top", (y + 50) + "px")    
        }


        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                //if find the name, change the attribute for r to 8 making the dot larger
                if(dotArr[i]._groups[0][k].attributes[4].textContent == tempName){
                    dotArr[i]._groups[0][k].attributes.r.value = 8
                }
                //else make them smaller!
                else{
                    dotArr[i]._groups[0][k].attributes.r.value = 1
                }
            }
        }

        //make the specifically hovered over dot largest
        if(isDot == 1){
            theName._groups[0][0].attributes.r.value = 12
        }

        //do it all again for lines
        for(var i = 0; i < lines.length; i++){
            if(lines[i]._groups[0][0].attributes[6].textContent == tempName){
                lines[i]._groups[0][0].attributes[1].value = 5
            }
            else{
                lines[i]._groups[0][0].attributes[1].value = 0.2
            }
        }
    }

    /*Opposite of highLight, returns the dots and lines to normal
    */
    function unHighLight(theName){
        //pull out the name of driver to be set to normal
        var tempName = theName._groups[0][0].attributes.name.textContent

        //remove tooltip
        tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        
        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                //if find the name, change the attribute for r to 3 making the dot the regular size
                if(dotArr[i]._groups[0][k].attributes[4].textContent == tempName){
                    dotArr[i]._groups[0][k].attributes.r.value = 3
                }
                //make larger again
                else{
                    dotArr[i]._groups[0][k].attributes.r.value = 3
                }
            }
        }

        //do it all again for lines
        for(var i = 0; i < lines.length; i++){
            if(lines[i]._groups[0][0].attributes[6].textContent == tempName){
                lines[i]._groups[0][0].attributes[1].value = 1.5
            }
            else{
                lines[i]._groups[0][0].attributes[1].value = 1.5
            }
        }        
    }

    //toggle button to filter out drivers with 0 points
    /*PROBLEM WITH BUTTON, this changes year to year, so should filter out driver with 0 points in 1 year, 
      but not their other years, or only remove that driver for the one year they have 0 points, but what
      about the lines? This also needs to change and use dotArr and lines arrays, becuase this implementation only
      affects the last year (2020) due to using a loop to create the dots
    *
    var boolFilter = 0
    d3.select("#tog0").on('click', function(){
        //filter off, turning on
        if(boolFilter == 0){
            boolFilter = 1
            //console.log("turning filter on")
            dots.transition().duration(0)
                .attr("r", d => {
                    if(d.points == 0)
                        return 0
                    return 5
                })
        }
        //filter on, turning off
        else{
            boolFilter = 0
            //console.log("turning filter off")
            dots.transition().duration(0)
                .attr("r", 5)
        }
    })
    */

    /******************************************************************************************************************
    ** NEED TO DO:
    **
    **-Better Colors --------------------------------------------------------------------------------------- INCOMPLETE
    **  -Right now colors get repeated in the same year and individuals get lost, need a unique color for each driver?
    **
    **-Highlighting driver on mouseover (simple interaction) - and mouseout removes highlight ---------------- COMPLETE
    **  -Mouseover will also bring up a popup with driver name - DONE
    **  -Mayber other info? Can add a variable to determine if a dot and show how many points? - DONE
    **  -Make other unhighlighted data darker/smaller - DONE
    **
    **-Filters to remove some drivers (simple interaction)? ------------------------------------------------ INCOMPLETE
    **  -Graph is crowded, may need to have ability to clear it up, not super necessary right now
    **
    **-Secondary Visualization ----------------------------------------------------------------------------- INCOMPLETE
    **  -Clicking dot or line will be used to select the driver for a secondary visualization
    **      -What information will this secondary vis have? Will be in a separate svg underneath or on the side.
    **          -Single season? Name, teammate, teamname(i.e. ferrari), points scored that season
    **          -Career? Name, similar to first graph but only the single driver? Total lifetime points
    **
    *///***************************************************************************************************************


})
