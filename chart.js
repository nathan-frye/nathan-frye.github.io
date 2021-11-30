/*Promise.all should create an array of the data files.
Access driverInfo.csv with dataset[0], raceInfo with dataset[1], etc.*/
Promise.all([
    d3.csv("driverInfo.csv"),
    d3.csv("raceInfo.csv"),
    d3.csv("results.csv"),
    d3.csv("constructors.csv"),
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

    var dimensions2 = {
        width: 1000,
        height: 500,
        margin: {
            top: 10,
            bottom: 30,
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

    var svg2 = d3.select("#chart2")
        .style("width", dimensions2.width)
        .style("height", dimensions2.height)

    //Group data by year (season)
    var years = d3.group(dataset[1], d=>d.year)

    //years that will be used in the visualization
    var yearsRange=[];
    for(var i = 1990; i <=2020; i++){
        yearsRange.push(i)
    }

    //Extract exact year (season) we're starting with
    var races = years.get("1990")

    //Group data by raceId
    var raceStandings = d3.group(dataset[2], d=>d.raceId)

    //Labels for the x-axis
    var labels = yearsRange;

    //set up x and y axis
    var xScale = d3.scaleBand()
        .domain(labels)
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

    //using 30 for max percent temp
    var yScale = d3.scaleLinear()
        .domain([0, 35])
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    //Expanded color scale to reduce the amound of overlap in colors. Need over double for actual unique colors?
    var scaleColor = d3.scaleOrdinal()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43])
        .range(['#A93226', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9', '#3498DB', '#1ABC9C', '#16A085', '#27AE60', '#28B463', 
            '#F1C40F', '#F39C12', '#E67E22', '#D35400', '#ECF0F1', '#FF6347', '#839192', '#34495E', '#2C3E50', '#7B241C', '#0E6251', 
            '#F7DC6F', '#C39BD3', '#808B96', '#515A5A', '#DB7093', '#4A235A', '#1B4F72', '#9A7D0A', '#7B7D7D', '#FFF8DC', '#DEB887', 
            '#BC8F8F', '#F4A460', '#DAA520', '#CD853F', '#D2691E', '#A0522D', '#2F4F4F', '#FF1493', '#90EE90', '#808000', '#7CFC00',])

    //For a filter to only show drivers that have won a championship
    var champList = ['Ayrton Senna', 'Nigel Mansell', 'Alain Prost', 'Michael Schumacher', 'Damon Hill', 'Jacques Villeneuve', 'Mika Häkkinen', 
        'Fernando Alonso', 'Kimi Räikkönen', 'Lewis Hamilton', 'Jenson Button', 'Sebastian Vettel', 'Nico Rosberg']

    //axis generator
    var xAxisgen = d3.axisBottom().scale(xScale)
    var yAxisgen = d3.axisLeft().scale(yScale)

    //initialize the x-axis
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
        .text("*Each line (and connecting dot) in this graph represents a driver that competed in the Formula 1 racing series between 1990 and 2020.")

    //graph information for easier user experience 2.0
    svg.append("text")
        .attr("transform", "translate(" + (dimensions.width/2) + " ," + (dimensions.height + dimensions.margin.top - 40) + ")")
        .style("text-anchor", "middle")
        .text("You can hover your mouse over any line to highlight it and see the driver name, and hovering over a dot will reveal more information.")

    //graph information for easier user experience 3.0
    svg.append("text")
        .attr("transform", "translate(" + (dimensions.width/2) + " ," + (dimensions.height + dimensions.margin.top - 25) + ")")
        .style("text-anchor", "middle")
        .text("The different colors represent the team that a driver drove for. If a line changes colors that means that the driver changed to a different team.")

        //initialize the y axis
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

    //Tie result to constructor id
    var driverConstructor = d3.group(seasonInfo, d => d.constructorId)
    //console.log(driverConstructor)

    //Make an array of total points earned for y-axis
    var points = Array.from(driverPoints.values())

    //variable to store all the points in a year for calculating percentage later
    var totForyear = 0

    for(var i = 0; i < points.length; i++){
        totForyear += points[i];
    }

    //Map all driver info to driverId (aka surname and forename)
    var driverNames = d3.group(dataset[0], d => d.driverId)
    //console.log(driverNames)
    
    //Convert driverPoints into an array
    var temp = Array.from(driverPoints)
    //console.log(temp)

    //same for driverConstructor
    var temp2 = Array.from(driverConstructor)
    //console.log(seasonInfo)



    //Map full driver names to their total points earned for the year (season)
    var data = temp.map(function(v){
        var d = driverNames.get(v[0])
        //console.log(d)
        return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[0], ID: d[0].driverId}
    })

    //array to store all the dots, used later for making the connecting lines
    //notation to access cx for example dotArr[0]._groups[0][0].cx.baseVal.value
    //notation to access the name dotArr[0]._groups[0][0].attributes[4].textContent
    var dotArr = []

    //creating the dots for the first year
    var dots = svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year) + 18)
        .attr("cy", d => yScale((d.points / totForyear) * 100))
        .attr("r", 3)
        //.attr("fill", "black")
        .attr("fill", function(d){
            //console.log(d)
            return dotColor(d3.select(this), d.year, d.ID)
        })
        .attr("name", d => d.name)
        .attr("name2", d=> d.points)
        .attr("name3", d => (d.points / totForyear) * 100)
        .attr("name4", d => d.year)
        .attr("name5", d => d.ID)
        //.attr("fill", "black")
        .on('mouseover', function(){
            highLight(d3.select(this), 1)
        })
        .on('click', function(d,i){
            displayDot(d3.select(this))
        })
        .on('mouseout', function(){
            unHighLight(d3.select(this))
        })


    dotArr.push(dots)

    //loop to create rest of dots all variables are used same as above
    for(var i = 1; i <= 30; i++){
        races = years.get(String(labels[i]))

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
            return {name: d[0].forename + " " + d[0].surname, points: v[1], year: labels[i], ID: d[0].driverId}
        })
    
        dots = svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year) + 18)
            .attr("cy", d => yScale((d.points / totForyear) * 100))
            .attr("r", 3)
            //.attr("fill", "black")
            .attr("fill", function(d){
                return dotColor(d3.select(this), d.year, d.ID)
            })
            .attr("name", d => d.name)
            .attr("name2", d => d.points)
            .attr("name3", d => (d.points / totForyear) * 100)
            .attr("name4", d => d.year)
            .attr("name5", d => d.ID)
            //.attr("fill", "black")
            .on("mouseover", function(d, i){
                highLight(d3.select(this), 1)
                //console.log(i)
            })
            .on('click', function(d,i){
                displayDot(d3.select(this))
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

    //We store the names of all drivers displayed on the chart here
    var secondaryNames = []

    //loop through years
    for(var i = 0; i < 30; i++){
        //loop through drivers in a year i
        for(var k = 0; k < dotArr[i]._groups[0].length; k++){

            //pull out specific name too search for in the next year
            currName = dotArr[i]._groups[0][k].attributes[4].textContent

            //set source x and y from current driver
            sourceX = dotArr[i]._groups[0][k].cx.baseVal.value
            sourceY = dotArr[i]._groups[0][k].cy.baseVal.value
            var color = dotArr[i]._groups[0][k].attributes.fill.value
            
            //loop through the next year i + 1 and find the driver
            for(var j = 0; j < dotArr[i + 1]._groups[0].length; j ++){

                //find same driver if they are in that year
                if(dotArr[i + 1]._groups[0][j].attributes[4].textContent == currName){
                    //If found and not already stored, store the name
                    if(!(secondaryNames.includes(currName)))
                    {
                        secondaryNames.push(currName)
                    }
                    //set target x and y from current driver from the next year
                    targetX = dotArr[i + 1]._groups[0][j].cx.baseVal.value
                    targetY = dotArr[i + 1]._groups[0][j].cy.baseVal.value

                    //draw the line
                    edge = svg.append("line")
                        .attr("stroke", String(color))
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

    //console.log(secondaryNames)
        
    /*When mousing over a dot or line, use its attribute "name" to find all of the corresponding
      dots and lines and make them larger, so that the driver is more easily distinguishable throughout
      the graph. It also checks to make sure that the dot isn't hidden by the filters.
    */
    function highLight(theName, isDot){
        //pull out the name of driver to be highlighted
        var tempName = theName._groups[0][0].attributes.name.textContent

        //keeps track of the mouse position
        const[x,y] = d3.pointer(event)

        //Show the information relating to a dot
        if(isDot == 1 && theName._groups[0][0].attributes.r.value != 0){
            var tempPoints = theName._groups[0][0].attributes.name2.textContent
            var tempPerc = theName._groups[0][0].attributes.name3.textContent
            tempPerc = tempPerc.substring(0, 4)
            tooltip
            .transition()
            .duration(200)
            .text(String(tempName) + "; Points: " + tempPoints + "; Points Percentage: " + tempPerc + "%")
            .style("opacity", 1)
            .style("left", (x + 100) + "px")
            .style("top", (y + 50) + "px")    
        }
        //Show only the name if it is a line
        else if(isDot == 0 && theName._groups[0][0].attributes[1].value != 0){
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
                if(dotArr[i]._groups[0][k].attributes[4].textContent == tempName && dotArr[i]._groups[0][k].attributes.r.value != 0){
                    dotArr[i]._groups[0][k].attributes.r.value = 8
                }
                //else make them smaller!
                else if(dotArr[i]._groups[0][k].attributes.r.value != 0){
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
            if(lines[i]._groups[0][0].attributes[6].textContent == tempName && lines[i]._groups[0][0].attributes[1].value != 0){
                lines[i]._groups[0][0].attributes[1].value = 5
            }
            else if(lines[i]._groups[0][0].attributes[1].value != 0){
                lines[i]._groups[0][0].attributes[1].value = 0.2
            }
        }
    }

    /*Opposite of highLight, returns the dots and lines to normal unless they are hidden.
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
                //make larger again
                if(dotArr[i]._groups[0][k].attributes.r.value != 0){
                    dotArr[i]._groups[0][k].attributes.r.value = 3
                }
            }
        }

        //do it all again for lines
        for(var i = 0; i < lines.length; i++){
            if(lines[i]._groups[0][0].attributes[1].value != 0){
                lines[i]._groups[0][0].attributes[1].value = 1.5
            }
        }        
    }

    //Button to display only drivers which have won a championship
    d3.select("#champs").on('click', function(){
        resetChart()
        clearSelections()
        var isChamp = 0
        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                //loop through list of champions, to see if the name is there
                for(var j = 0; j < 13; j++){
                    if(dotArr[i]._groups[0][k].attributes[4].textContent == champList[j]){
                        isChamp = 1
                        if(!(secondarySelectedDrivers.includes(champList[j])))
                        {
                            secondarySelectedDrivers.push(champList[j])
                        }
                    }
                }
                //if driver is not a champion, make the dot invisible
                if(isChamp == 0){
                    dotArr[i]._groups[0][k].attributes.r.value = 0
                }
                //set isChamp to zero for next driver
                isChamp = 0
            }
        }

        isChamp = 0
        //do the same for the lines
        for(var i = 0; i < lines.length; i++){
            for(var j = 0; j < 13; j++){
                if(lines[i]._groups[0][0].attributes[6].textContent == champList[j]){
                    isChamp = 1
                }
            }
            if(isChamp == 0){
                lines[i]._groups[0][0].attributes[1].value = 0
            }
            isChamp = 0
        }
        champSelections()
    })

    //Button to reset graph
    d3.select("#reset").on('click', function(){
      resetChart()
      resetSelections()
    })

    d3.select("#clear").on('click', function(){
        clearSelections()
        displaySelectedDrivers()
    })

    //Reset the chart display
    function resetChart()
    {
        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                dotArr[i]._groups[0][k].attributes.r.value = 3
            }
        }

        //do it all again for lines
        for(var i = 0; i < lines.length; i++){
            lines[i]._groups[0][0].attributes[1].value = 1.5
        }  
    }

    //Sort the names alphabetically and create another array to store user selections
    secondaryNames.sort()
    var secondarySelectedDrivers = Array.from(secondaryNames)

    //console.log(secondaryNames)

    //Create HTML elements to store the names
    var div = document.createElement('div')
    var list = document.createElement('ul')

    //Create the list displayed next to the graph
    function populateList()
    {
        list.innerHTML = ""

        //Find HTML body by tag name and append our div element to it and our list to our div
        document.getElementById("menu").appendChild(div)
        div.appendChild(list)

        //Loop through each name and append it to the list
        for(var i = 0; i < secondaryNames.length; ++i)
        {
            var row = document.createElement('li')
            row.classList.toggle('checked')
            row.innerHTML = secondaryNames[i]

            list.appendChild(row)
        }
    }
    populateList()

    //Add a click function to each list element
    var secondaryCheckList = document.querySelector('ul')
    secondaryCheckList.addEventListener('click', function(d){
        if(d.target.tagName === 'LI')
        {
            //Adds or removes the "checked" attribute from the HTML <li> elements
            d.target.classList.toggle('checked')
            //Remove clicked name from the selection array if it's already selected
            if(secondarySelectedDrivers.includes(d.target.innerHTML))
            {
                var index = secondarySelectedDrivers.indexOf(d.target.innerHTML)
                if(index != -1)
                {
                    secondarySelectedDrivers.splice(index, 1)
                }
                displaySelectedDrivers()
            }
            //Otherwise, push it to the picked list of names
            else
            {
                secondarySelectedDrivers.push(d.target.innerHTML)
                //console.log(secondarySelectedDrivers)
                displaySelectedDrivers()
            }
        }
    })

    //highlight in graph when mousing over a name in the list
    secondaryCheckList.addEventListener('mouseover', function(d){
        var tempName = d.target.innerHTML
        //make sure it is clicked
        if(secondarySelectedDrivers.includes(d.target.innerHTML)){
        //loop through years
            for(var i = 0; i <= 30; i++){
                //loop through drivers in year i
                for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                    //if find the name, change the attribute for r to 8 making the dot larger
                    if(dotArr[i]._groups[0][k].attributes[4].textContent == tempName && dotArr[i]._groups[0][k].attributes.r.value != 0){
                        dotArr[i]._groups[0][k].attributes.r.value = 8
                    }
                    //else make them smaller!
                    else if(dotArr[i]._groups[0][k].attributes.r.value != 0){
                        dotArr[i]._groups[0][k].attributes.r.value = 1
                    }
                }
            }

            //do it all again for lines
            for(var i = 0; i < lines.length; i++){
                if(lines[i]._groups[0][0].attributes[6].textContent == tempName && lines[i]._groups[0][0].attributes[1].value != 0){
                    lines[i]._groups[0][0].attributes[1].value = 5
                }
                else if(lines[i]._groups[0][0].attributes[1].value != 0){
                    lines[i]._groups[0][0].attributes[1].value = 0.2
                }
            }
        }
    })

    //unhighlight when mouseout from the list
    secondaryCheckList.addEventListener('mouseout', function(d){
        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                //make larger again
                if(dotArr[i]._groups[0][k].attributes.r.value != 0){
                    dotArr[i]._groups[0][k].attributes.r.value = 3
                }
            }
        }

        //do it all again for lines
        for(var i = 0; i < lines.length; i++){
            if(lines[i]._groups[0][0].attributes[1].value != 0){
                lines[i]._groups[0][0].attributes[1].value = 1.5
            }
        }        
    })

    //Reset the graph and display only the selected drivers
    function displaySelectedDrivers()
    {
        resetChart()
        var isSelected = 0
        //loop through years
        for(var i = 0; i <= 30; i++){
            //loop through drivers in year i
            for(var k = 0; k < dotArr[i]._groups[0].length; k++){
                //loop through list of champions, to see if the name is there
                for(var j = 0; j < secondarySelectedDrivers.length; j++){
                    if(dotArr[i]._groups[0][k].attributes[4].textContent == secondarySelectedDrivers[j]){
                        isSelected = 1
                    }
                }
                //if driver is not a champion, make the dot invisible
                if(isSelected == 0){
                    dotArr[i]._groups[0][k].attributes.r.value = 0
                }
                //set isChamp to zero for next driver
                isSelected = 0
            }
        }

        isSelected = 0
        //do the same for the lines
        for(var i = 0; i < lines.length; i++){
            for(var j = 0; j < secondarySelectedDrivers.length; j++){
                if(lines[i]._groups[0][0].attributes[6].textContent == secondarySelectedDrivers[j]){
                    isSelected = 1
                }
            }
            if(isSelected == 0){
                lines[i]._groups[0][0].attributes[1].value = 0
            }
            isSelected = 0
        }   
    }

    //Run through list and highlight all champions
    function champSelections()
    {
        //console.log(secondarySelectedDrivers)
        var d = document.getElementsByTagName('li')
        secondarySelectedDrivers.sort()
        champList.sort()
        var i = 0
        var j = 0
        while(j < secondarySelectedDrivers.length)
        {
            while(i < d.length)
            {
                //console.log(secondarySelectedDrivers[j])
                //console.log(d[i].innerHTML)
                if(d[i].innerHTML == secondarySelectedDrivers[j])
                {
                    d[i].classList.add('checked')
                    i++
                    break
                }
                else
                {
                    d[i].classList.remove('checked')
                }
                i++
            }
            j++
        }
    }

    //Reset the user selections
    function resetSelections()
    {
        secondarySelectedDrivers = Array.from(secondaryNames)
        var d = document.getElementsByTagName('li')
        var i = 0
        while(i < d.length)
        {
            d[i].classList.add('checked')
            i++
        }
    }

    //Clear the user selections
    function clearSelections()
    {
        secondarySelectedDrivers = []
        var d = document.getElementsByTagName('li')
        var i = 0
        while(i < d.length)
        {
            d[i].classList.remove('checked')
            i++
        }
    }

    /******************************************************************************************************************
    ** NEED TO DO:
    **
    **-Better Colors ----------------------------------------------------------------------------------------- COMPLETE
    **  -Right now colors get repeated in the same year and individuals get lost, need a unique color for each driver?
    **
    **-Highlighting driver on mouseover (simple interaction) - and mouseout removes highlight ---------------- COMPLETE
    **  -Mouseover will also bring up a popup with driver name - DONE
    **  -Mayber other info? Can add a variable to determine if a dot and show how many points? - DONE
    **  -Make other unhighlighted data darker/smaller - DONE
    **
    **-Filters to remove some drivers (simple interaction)? -------------------------------------------------- COMPLETE
    **  -Graph is crowded, may need to have ability to clear it up, not super necessary right now
    **  -Button to show only drivers who have won a championship - DONE
    **  -Maybe something like, find out which top % of the drivers have the most points? Find out sum of percentage
    **      achieved for each driver over their career (this can go over 100% since is a sum) and then show the top
    **      10 or something?
    **
    **-Secondary Visualization ----------------------------------------------------------------------------- COMPLETISH
    **  -Clicking dot or line will be used to select the driver for a secondary visualization
    **      -What information will this secondary vis have? Will be in a separate svg underneath or on the side.
    **          -Single season? Name, teammate, teamname(i.e. ferrari), points scored that season
    **          -Career? Name, similar to first graph but only the single driver? Total lifetime points
    **      -Idea: Ability to click a driver in first vis, and add them to secondary vis, allowing a user to pick just
    **          the drivers that they want, and display the info in the same way?
    **      -Idea: Clicking a dot will give information specific to that driver and year. Like teammate, team name
    **          same points, and points percentage. Mayybe info specific to each race in that season?
    **          Does it have to be a fancy chart or can it be something like:
    **          Name:       "xxx"
    **          Year:       "xxx"
    **          Team:       "xxx"
    **          Teammate:   "xxx"
    **          -Perhaps it could just be beside the first graph?
    *///***************************************************************************************************************

    var c2Title = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2) + " ," + (dimensions2.height + dimensions2.margin.top - 450) + ")")
        .style("text-anchor", "middle")
        .text("Here is information for the selected driver. In order to select a driver, click on a dot.")

    var c2Name = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2 - 200) + " ," + (dimensions2.height + dimensions2.margin.top - 420) + ")")
        .style("text-anchor", "left")
        .text("Name: ")

    var c2Year = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2 - 200) + " ," + (dimensions2.height + dimensions2.margin.top - 400) + ")")
        .style("text-anchor", "left")
        .text("Year: ")

    var c2Points = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2 - 200) + " ," + (dimensions2.height + dimensions2.margin.top - 380) + ")")
        .style("text-anchor", "left")
        .text("Points: ")

    var c2Team = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2 - 200) + " ," + (dimensions2.height + dimensions2.margin.top - 360) + ")")
        .style("text-anchor", "left")
        .text("Team: ")

    var c2Teammate = svg2.append("text")
        .attr("transform", "translate(" + (dimensions2.width/2 - 200) + " ," + (dimensions2.height + dimensions2.margin.top - 340) + ")")
        .style("text-anchor", "left")
        .text("Teammate: ")

    function displayDot(info){        
        /*c2Name.text("Name: " + info._groups[0][0].attributes.name.textContent)
        c2Year.text("Year: " + info._groups[0][0].attributes.name4.textContent)
        c2Points.text("Points: " + info._groups[0][0].attributes.name2.textContent)
        */
        document.getElementById("infoName").innerHTML = info._groups[0][0].attributes.name.textContent
        document.getElementById("infoYear").innerHTML = info._groups[0][0].attributes.name4.textContent
        document.getElementById("infoPoints").innerHTML = info._groups[0][0].attributes.name2.textContent
        
        var dId = info._groups[0][0].attributes.name5.textContent
        var teamId = "none"
        var teamName = "none"
        var d2 = 0

        races = years.get(info._groups[0][0].attributes.name4.textContent)

        var seasonInfo2 = races.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })

        var driverPoints2 = d3.rollup(seasonInfo2, v => d3.sum(v, d => d.points), d => d.driverId)

        //find constructor id 
        for(var i = 0; i < seasonInfo2.length; i++){
            if(seasonInfo2[i].driverId == info._groups[0][0].attributes.name5.textContent){
                teamId = seasonInfo2[i].constructorId
            }
        }

        //get team name from constructor id 
        for(var i = 0; i < dataset[3].length; i++){
            if(teamId == dataset[3][i].constructorId){
                teamName = dataset[3][i].name
            }
        }

        document.getElementById("infoTeam").innerHTML = teamName
        //c2Team.text("Team: " + teamName)

        //find other driver with same constructor
        for(var i = 0; i < seasonInfo2.length; i++){
            if(seasonInfo2[i].constructorId == teamId && seasonInfo2[i].driverId != dId){
                d2 = seasonInfo2[i].driverId
            }
        }

        var driverNames2 = Array.from(driverNames)
        //get the teammate name
        var tn1 = "none"
        var tn2 = "none"
        for(var i = 0; i < driverNames2.length; i++){
            if(driverNames2[i][1][0].driverId == d2){
                tn1 = driverNames2[i][1][0].forename
                tn2 = driverNames2[i][1][0].surname
            }
        }
        //c2Teammate.text("Teammate: " + tn1 + " " + tn2)
        document.getElementById("infoTeammate").innerHTML = tn1 + " " + tn2
    }
    
    //finds the correct color for a dot representing the constructor based on the name and year
    function dotColor(info, y, id){        

        //console.log(info)
        //console.log(y)
        var teamId = "none"

        var race = years.get(String(y))
        //console.log(race)

        var seasonInfo2 = race.flatMap(function(v){
            return raceStandings.get(v.raceId)
        })

        var driverPoints2 = d3.rollup(seasonInfo2, v => d3.sum(v, d => d.points), d => d.driverId)

        //find constructor id 
        for(var i = 0; i < seasonInfo2.length; i++){
            if(seasonInfo2[i].driverId == id){
                teamId = seasonInfo2[i].constructorId
            }
        }
        var colorCon = "none"
        for(var i = 0; i < dataset[3].length; i++){
            if(dataset[3][i].constructorId == teamId){
                colorCon = dataset[3][i].hexColor
            }
        }
        //console.log(colorCon)
        return colorCon
    }


})
