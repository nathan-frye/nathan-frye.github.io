/*Promise.all should create an array of the data files.
Access driverInfo.csv with dataset[0], raceInfo with dataset[1], etc.*/
Promise.all([
    d3.csv("driverInfo.csv"),
    d3.csv("raceInfo.csv"),
    d3.csv("results.csv"),
]).then(function(dataset)
{
    var dimensions = {
        width: 1600,
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

    //create array of just the years for the dropdown
    var yearsOnly=[];
    for(var i = 1950; i <= 2020; i++){
        yearsOnly.push(i)
    }

    var yearsRange=[];
    for(var i = 1990; i <=2020; i++){
        yearsRange.push(i)
    }
    //console.log(yearsOnly)

    var startYear = "1990"
    //Extract exact year (season) we're starting with
    var races = years.get("1990")
    //console.log(races)

    //Group data by raceId
    var raceStandings = d3.group(dataset[2], d=>d.raceId)
    //console.log(raceStandings)

    var labels = yearsRange;
    //console.log(labels)

    //set up x and y axis
    var xScale = d3.scaleBand()
                    .domain(labels)
                    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                    //.padding(0.2)

    //using 450 temporarily, in future want to use % of total
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

    var bars = svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year) + 25)
        .attr("cy", d => yScale(d.points))
        .attr("r", 5)
        .attr("fill", d => scaleColor(d.name))

    var lines = svg.selectAll("path")
        .data(data)
        .attr("fill", "none")
        .attr("stroke", d=> scaleColor(d.name))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.points))
        )

    

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
            .attr("cx", d => xScale(d.year) + 25)
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

    //Make an array of relevant drivers for the year
    //var drivers = Array.from(driverPoints.keys())
    //console.log(drivers)



    //console.log(data)

    //Create our labels for the x-axis
    //var labels = data.map(d => d.name)
    

})
