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
    //console.log(yearsOnly)

    //add options to button
    d3.select("#selectButton")
        .selectAll('myOptions')
            .data(yearsOnly)
        .enter()
            .append('option')
        .text(d => d)
        .attr("value", d => d)
    
    //Extract exact year (season) we're working with
    var races = years.get("1950")
    //console.log(races)

    //Group data by raceId
    var raceStandings = d3.group(dataset[2], d=>d.raceId)
    //console.log(raceStandings)

    //Extract race info for the year (season) we're working with
    var seasonInfo = races.flatMap(function(v){
        return raceStandings.get(v.raceId)
    })
    //console.log(seasonInfo)

    //Tie the driverID to the total points earned by that driver for the year (season)
    var driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)
    //console.log(driverPoints)

    //Make an array of relevant drivers for the year
    //var drivers = Array.from(driverPoints.keys())
    //console.log(drivers)

    //Map all driver info to driverId (aka surname and forename)
    var driverNames = d3.group(dataset[0], d => d.driverId)
    //console.log(driverNames)

    //Map driverId to full name (forename + surname)
    /*var driverData = drivers.flatMap(function(v){
        var d = driverNames.get(v)
        return {driverId: d[0].driverId, name: d[0].forename + " " + d[0].surname}
    })*/
    //console.log(driverData)

    //Make an array of total points earned for y-axis
    var points = Array.from(driverPoints.values())
    //console.log(points)

    //Convert driverPoints into an array
    var temp = Array.from(driverPoints)
    //console.log(temp)

    //Map full driver names to their total points earned for the year (season)
    var data = temp.map(function(v){
        var d = driverNames.get(v[0])
        return {name: d[0].forename + " " + d[0].surname, points: v[1]}
    })
    //console.log(data)

    //Create our labels for the x-axis
    var labels = data.map(d => d.name)
    //console.log(labels)

    var xScale = d3.scaleBand()
                    .domain(labels)
                    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                    .padding(0.2)

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(points)])
                    .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    var scaleColor = d3.scaleOrdinal()
                        .domain(labels)
                        .range(d3.schemeCategory10)

    var xAxisgen = d3.axisBottom().scale(xScale)
    var yAxisgen = d3.axisLeft().scale(yScale)

    var xAxis = svg.append("g")
                    .call(xAxisgen)
                    .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)
                    .selectAll("text")
                        .attr("dx", "-4em")
                        .attr("dy", ".35em")
                        .attr("transform", "rotate(-65)")

    var yAxis = svg.append("g")
                    .call(yAxisgen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)
    
    var bars = svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", d => xScale(d.name))
                    .attr("y", d => yScale(d.points))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => dimensions.height - dimensions.margin.bottom - yScale(d.points))
                    .attr("fill", d => scaleColor(d.name))

    //update the graph when a new year is selected
    function update(newData){
        svg.selectAll("*").remove()

        races = years.get(String(newData))

        raceStandings = d3.group(dataset[2], d=>d.raceId)

        seasonInfo = races.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })

        driverPoints = d3.rollup(seasonInfo, v => d3.sum(v, d => d.points), d => d.driverId)

        driverNames = d3.group(dataset[0], d => d.driverId)

        points = Array.from(driverPoints.values())

        temp = Array.from(driverPoints)

        data = temp.map(function(v){
            var d = driverNames.get(v[0])
            return {name: d[0].forename + " " + d[0].surname, points: v[1]}
        })

        labels = data.map(d => d.name)
        //console.log(labels)
        //FIXME
        xScale = d3.scaleBand()
                        .domain(labels)
                        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                        .padding(0.2)

        yScale = d3.scaleLinear()
                        .domain([0, d3.max(points)])
                        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

        scaleColor = d3.scaleOrdinal()
                            .domain(labels)
                            .range(d3.schemeCategory10)

        xAxisgen = d3.axisBottom().scale(xScale)
        yAxisgen = d3.axisLeft().scale(yScale)

        //replaced these with svg.remove
        //xAxis.remove()
        //yAxis.remove()

        xAxis = svg.append("g")
            .call(xAxisgen)
            .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)
            .selectAll("text")
                .attr("dx", "-4em")
                .attr("dy", ".2em")
                .attr("transform", "rotate(-65)")

        yAxis = svg.append("g")
            .call(yAxisgen)
            .style("transform", `translateX(${dimensions.margin.left}px)`)
        
        //replaced these with svg.remov
        //bars.remove()
        bars = svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.name))
            .attr("y", d => yScale(d.points))
            .attr("width", xScale.bandwidth())
            .attr("height", d => dimensions.height - dimensions.margin.bottom - yScale(d.points))
            .attr("fill", d => scaleColor(d.name))

    }

    //default year if don't want to start blank
    //update(yearsOnly[0])

    //add years to the dropdown
    d3.select("#selectButton")
        .on('change', function() {
            var newData = eval(d3.select(this).property('value'));
            update(newData);
        })
})
