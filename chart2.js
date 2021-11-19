/*Promise.all should create an array of the data files.
Access driverInfo.csv with dataset[0], raceInfo with dataset[1], etc.*/
Promise.all([
    d3.csv("driverInfo.csv"),
    d3.csv("raceInfo.csv"),
    d3.csv("results.csv"),
]).then(function(dataset)
{
    var dimensions = {
        width: 1400,
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
    //console.log(years)

    //create array of just the years 1990-2020
    var yearsRange=[];
    for(var i = 1990; i <=2020; i++){
        yearsRange.push(i)
    }

    //Extract exact year (season) we're starting with FIXME can probably be deleted if dat2 works
    var races = years.get("1990")

    //Group data by raceId
    var raceStandings = d3.group(dataset[2], d=>d.raceId)

    var labels = yearsRange;
    //console.log(labels)

    //set up x and y axis
    var xScale = d3.scaleBand()
                    .domain(labels)
                    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                    .padding(0.2)

    //using 450 temporarily, in future want to use % of total depending on what driver has the
    //highest % of points for that respective season
    var yScale = d3.scaleLinear()
                    .domain([0, 450])
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
    
/*
    //Extract race info for the year (season) we're working with
    var seasonInfo = races.flatMap(function(v){
        return raceStandings.get(v.raceId)
    })
    //console.log(seasonInfo)

    //Tie the driverID to the total points earned by that driver for the year (season)
    var driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)
    //console.log(driverPoints)

    //Make an array of total points earned for y-axis
    var points = Array.from(driverPoints.values())
    //console.log(points)

    //Map all driver info to driverId (aka surname and forename)
    var driverNames = d3.group(dataset[0], d => d.driverId)
    //console.log(driverNames)
    

    //Convert driverPoints into an array
    var temp = Array.from(driverPoints)
    //console.log(temp) 

    //Map full driver names to their total points earned for the year (season)
    var data = temp.map(function(v){
        var d = driverNames.get(v[0])
        return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[0]}
    })

    FIXME END OF COMMENT can maybe delete later if dat2 works out*/

    //create a data variable with info for every year so don't need to separate 
    //graph creation into two separate areas?
    var dat2 = [];
    for(var i = 0; i <= 30; i++){
        var rInfo = years.get(String(labels[i]))

        var seInfo = rInfo.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })

        var dPoints = d3.rollup(seInfo, v => d3.sum(v, d=> d.points), d => d.driverId)
        var onlyP = Array.from(dPoints.values())
        var dNames = d3.group(dataset[0], d => d.driverId)
        var nTemp = Array.from(dPoints)

        //only difference is using an array with each index being a year
        dat2.push(nTemp.map(function(v){
            var d = dNames.get(v[0])
            return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[i]}
        }))
    }
//console.log(dat2)

    var bars = svg.selectAll("dot")
        .data(dat2)
        .enter()
        .append("circle")
        //using for loops here doesn't really work either, as it is not putting a dot in each
        //iteration of the loop but moving the positions of the would be dot around
        //can maybe try loop{
        //                  .attr(...)
        //              }
        .attr("cx", d => {
            //console.log(d[0])
            for(var i = 0; i < d.length; i++){
                //console.log(d[i].year)
                //console.log(xScale(d[i].year))
                xScale(d[i].year) //+ 20
            }
        })
        //same issue here as well as having yScale give really large values.
        .attr("cy", d => {
            for(var i = 0; i < d.length; i++){
                //console.log(d[i].points)
                yScale(d[i].points)
            }
        })
        .attr("r", 5)
        .attr("fill", d => scaleColor(d[0].name))

        //can try something like d => f => xScale(d[0]f[0].year) like a double loop?

    /* //worrying about dots first
    var lines = svg.selectAll("path")
        .data(dat2)
        .attr("fill", "none")
        .attr("stroke", d=> scaleColor(d[0].name))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d[0].year))
            .y(d => yScale(d[0].points))
        )
    //FIXME END OF COMMENT DONT DELETE*/

    /* may not be needed
    //loop to create rest of dots
    for(var i = 1; i <= 30; i++){
        races = years.get(String(labels[i]))

        //Extract race info for the year (season) we're working with
        seasonInfo = races.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })
        //console.log(seasonInfo)
    
        driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)
        
        points = Array.from(driverPoints.values())
        
        driverNames = d3.group(dataset[0], d => d.driverId)
        
    
        temp = Array.from(driverPoints)
        
        data = temp.map(function(v){
            var d = driverNames.get(v[0])
            return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[i]}
        })
    
        bars = svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year) + 22)
            .attr("cy", d => yScale(d.points))
            .attr("r", 5)
            .attr("fill", d => scaleColor(d.name))

        lines = svg.selectAll("path")
            .data(data)
            .attr("fill", "none")
            .attr("stroke", d=> scaleColor(d.name))
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.points))
            )
    
    
    }
    FIXME END OF COMMENT can probably be deleted later*/

    //Make an array of relevant drivers for the year
    //var drivers = Array.from(driverPoints.keys())
    //console.log(drivers)



    //console.log(data)

    //Create our labels for the x-axis
    //var labels = data.map(d => d.name)
    

})
