//function that takes three parameters: stationId, url(where to get data from)[maybe combine url and stationId into one], the dom container(div that contains the calendar)
//url where to get the data#calendar
var wimCalendar = {
  drawCalendar:function(input_data){
	  var m = [19, 20, 20, 19], // top right bottom left margin
	    w = 800 - m[1] - m[3], // width
	    h = 136 - m[0] - m[2], // height
	    z = 14; // cell size

	    var day = d3.time.format("%w"),
	        week = d3.time.format("%U"),
	        percent = d3.format(".1%"),
	        format = d3.time.format("%Y-%m-%d");
	    var values = [];
	    input_data.forEach(function(input){
	    	values.push(+input.numTrucks);
	    })

	    var color = d3.scale.quantize()
	        .domain([d3.min(values), d3.max(values)])
	        .range(colorbrewer.RdYlGn[11]);


	    var svg = d3.select("#caldiv").selectAll("svg")
	        .data(d3.range(2012, 2013))
	      .enter().append("svg")
	        .attr("width", w + m[1] + m[3]+100)
	        .attr("height", h + m[0] + m[2]+220)
	        .attr("class", "RdYlGn")
	      .append("g")
	        .attr("transform", "translate(" + (m[3] + (w - z * 53) / 2) + "," + (m[0] + (h - z * 7) / 2) + ")");

	    svg.append("text")
	        .attr("transform", "translate(-6," + z * 3.5 + ")rotate(-90)")
	        .attr("text-anchor", "middle")
	        .text(String);

	    var rect = svg.selectAll("rect.day")
	        .data(function(d) { 
	          //console.log(d)
	          return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
	      .enter().append("rect")
	        .attr("class", "day")
	        .attr("width", z)
	        .attr("height", z)
	        .attr("x", function(d) { return week(d) * z; })
	        .attr("y", function(d) { return day(d) * z; })
	        //.map(format);

	    rect.append("title")
	        .text(function(d) { return d; });


	      //console.log(data);
	      //console.log(data.map(csv));

	      rect.filter(function(d) { return format(d) in data; })
	          .attr("style", function(d) { 
	          //  console.log('hello',color(data[format(d)]),data[format(d)],color(2045)); 
	            return  "fill:"+color(data[format(d)])+";"; })
	        .select("title") //Creates hover icon
	          .text(function(d) { return d + ": " + data[format(d)]; }); //creates hover icon

	          var data = colorDays(svg,input_data,monthPath,rect,color)

	      //Legend is drawn below


	      	//truckData should contain strings detailing which truck goes where
	        var truckData = [Math.floor(color.invertExtent("#a50026")[0]) + " - " + Math.floor(color.invertExtent("#a50026")[1])+" Trucks",Math.floor(color.invertExtent("#d73027")[0]) + " - " + Math.floor(color.invertExtent("#d73027")[1])+" Trucks",Math.floor(color.invertExtent("#f46d43")[0]) + " - " + Math.floor(color.invertExtent("#f46d43")[1])+" Trucks",Math.floor(color.invertExtent("#fdae61")[0]) + " - " + Math.floor(color.invertExtent("#fdae61")[1])+" Trucks",Math.floor(color.invertExtent("#fee08b")[0]) + " - " + Math.floor(color.invertExtent("#fee08b")[1])+" Trucks",Math.floor(color.invertExtent("#ffffbf")[0]) + " - " + Math.floor(color.invertExtent("#ffffbf")[1])+" Trucks",Math.floor(color.invertExtent("#d9ef8b")[0]) + " - " + Math.floor(color.invertExtent("#d9ef8b")[1])+" Trucks",Math.floor(color.invertExtent("#a6d96a")[0]) + " - " + Math.floor(color.invertExtent("#a6d96a")[1])+" Trucks",Math.floor(color.invertExtent("#66bd63")[0]) + " - " + Math.floor(color.invertExtent("#66bd63")[1])+" Trucks",Math.floor(color.invertExtent("#1a9850")[0]) + " - " + Math.floor(color.invertExtent("#1a9850")[1])+" Trucks",Math.floor(color.invertExtent("#006837")[0]) + " - " + Math.floor(color.invertExtent("#006837")[1])+" Trucks"]
	        //console.log(truckData)
	        var legend = svg.selectAll(".legend")
				      .data(truckData.slice())
				    .enter().append("g")
				      .attr("class", "legend")
				      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; }); //Displays ordering of legend

				//Coordinates of legend
				var color2 = d3.scale.ordinal()
    			.range(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]);

				  legend.append("rect")
				      .attr("x", 0)
				      .attr("y", 120)
				      .attr("width", 18)
				      .attr("height", 18)
				      .style("fill", color2);

				  legend.append("text")         //Sets text of legend
				      .attr("x", 25)
				      .attr("y", 130)
				      .attr("dy", ".35em")
				      .style("text-anchor", "front")
				      .text(function(d) { return d; });


	    function monthPath(t0) {
	      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
	          d0 = +day(t0), w0 = +week(t0),
	          d1 = +day(t1), w1 = +week(t1);
	      return "M" + (w0 + 1) * z + "," + d0 * z
	          + "H" + w0 * z + "V" + 7 * z
	          + "H" + w1 * z + "V" + (d1 + 1) * z
	          + "H" + (w1 + 1) * z + "V" + 0
	          + "H" + (w0 + 1) * z + "Z";
	    }
	},
	colorDays:function(svg,input_data,monthPath,rect,color){
  var format = d3.time.format("%Y-%m-%d");

			    svg.selectAll("path.month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

    	//console.log(csv);
    	//console.log(input_data);
      var data = d3.nest() 
        .key(function(d) { /*console.log(d,d.Open);*/ return d.date; }) //Creates key value
        .rollup(function(d) { return +d[0].numTrucks; }) //create pair value
        .map(input_data); //Turns code into an array of objects

         rect.filter(function(d) { return format(d) in data; })
	          .attr("style", function(d) { 
	          //  console.log('hello',color(data[format(d)]),data[format(d)],color(2045)); 
	            return  "fill:"+color(data[format(d)])+";"; })
	        .select("title") //Creates hover icon
	          .text(function(d) { return d + ": " + data[format(d)]; }); //creates hover icon

	  return data;

	}
}