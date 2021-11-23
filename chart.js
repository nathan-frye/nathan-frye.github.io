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

    //console.log(dataset)

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
        .domain(labels)
        .range(d3.schemeCategory10)

    var xAxisgen = d3.axisBottom().scale(xScale)
    var yAxisgen = d3.axisLeft().scale(yScale)

    var xAxis = svg.append("g")
        .call(xAxisgen)
        .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)
        //.selectAll("text")
            //.attr("dx", "-4em")
            //.attr("dy", ".1em")
            //.attr("transform", "rotate(-65)")

    var yAxis = svg.append("g")
                    .call(yAxisgen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)
    
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

    //array to store all the dots, can be used for making the connecting lines?
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

    dotArr.push(dots)
    /*
    var lines = svg.selectAll("path")
        .data(data)
        .attr("fill", "none")
        .attr("stroke", d=> scaleColor(d.name))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.points))
        )
    */

    //loop to create rest of dots
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

        dotArr.push(dots)

        /* add lines later
        lines = svg.selectAll("path")
            .data(data)
            .attr("fill", "none")
            .attr("stroke", d=> scaleColor(d.name))
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.points))
            )
        */
    
    
    }

    console.log(dotArr)

    /*Adding the lines by looking at information for one year, and then comparing it to the next
      year and seeing if that driver competed between multiple years.
    */
    var sourceX = 0
    var sourceY = 0
    var targetX = 0
    var targetY = 0
    var currName = "none"

    //loop through years minus one because last year doesn't connect to anything
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
                    svg.append("line")
                        .attr("stroke", scaleColor(currName)) //scaleColor(currName) use once working
                        .attr("stoke-width", 1)
                        .attr("x1", sourceX)
                        .attr("y1", sourceY)
                        .attr("x2", targetX)
                        .attr("y2", targetY)
                        .attr("name", currName)
                        .on('mouseover', function(){
                            d3.select(this)
                                .attr("stroke-width", 4)
                        })
                        .on('mouseout', function(){
                            d3.select(this)
                                .attr("stroke-width", 1)
                        })
                }
            }
        }
    }

    //array to store all the dots, can be used for making the connecting lines?
    //notation to access cx for example dotArr[0]._groups[0][0].cx.baseVal.value
    //notation to access the name dotArr[0]._groups[0][0].attributes[4].textContent


    //toggle button to filter out drivers with 0 points
    /*PROBLEM WITH BUTTON, only removes from most recent year(2020)? Possibly because of using a
      loop to add the dots? Though button is not very necessary to be honest... possible useful
      to add more filters for like top 10% or top 50% or something like that.
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
   
    //Make an array of relevant drivers for the year
    //var drivers = Array.from(driverPoints.keys())
    //console.log(drivers)



    //console.log(data)

    //Create our labels for the x-axis
    //var labels = data.map(d => d.name)
    

})
