var lineChart = {
	
	svg:{},

	initlineChart:function(elem){
		lineChart.margin = {top: 5, right: 5, bottom: 10, left:50},
		lineChart.width = parseInt($(elem).width()) - lineChart.margin.left - lineChart.margin.right,
		lineChart.height = parseInt($(elem).width()*0.75) - lineChart.margin.top - lineChart.margin.bottom;

		lineChart.svg = d3.select(elem).append("svg")
		    .attr("width", lineChart.width + lineChart.margin.left + lineChart.margin.right)
		    .attr("height", lineChart.height + lineChart.margin.top + lineChart.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + lineChart.margin.left + "," + lineChart.margin.top + ")");

		/*The majority of the commented out code for the time being is the voronoi code*/


		//Below is for voronoi

		// var months,
		//     monthFormat = d3.time.format("%Y-%m");

		// var margin = {top: 20, right: 30, bottom: 30, left: 40},
		//     width = 960 - margin.left - margin.right,
		//     height = 500 - margin.top - margin.bottom;

		// var x = d3.time.scale()
		//     .range([0, width]);

		// var y = d3.scale.linear()
		//     .range([height, 0]);

		// var color = d3.scale.category20();

		// //Above is typical stuff

		// var voronoi = d3.geom.voronoi()
		//     .x(function(d) { return x(d.date); })
		//     .y(function(d) { return y(d.value); })
		//     .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

		// //Below is used to draw line

		// var line = d3.svg.line()
		//     .x(function(d) { return x(d.date); })
		//     .y(function(d) { return y(d.value); });

		// var svg = d3.select(elem).append("svg")
		//     .attr("width", width + margin.left + margin.right)
		//     .attr("height", height + margin.top + margin.bottom)
		//   .append("g")
		//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// d3.tsv("data.tsv", type, function(error, cities) {
		//   x.domain(d3.extent(months));
		//   y.domain([0, d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.value; }); })]).nice();

		//   svg.append("g")
		//       .attr("class", "axis axis--x")
		//       .attr("transform", "translate(0," + height + ")")
		//       .call(d3.svg.axis()
		//         .scale(x)
		//         .orient("bottom"));

		//   svg.append("g")
		//       .attr("class", "axis axis--y")
		//       .call(d3.svg.axis()
		//         .scale(y)
		//         .orient("left")
		//         .ticks(10, "%"))
		//     .append("text")
		//       .attr("x", 4)
		//       .attr("dy", ".32em")
		//       .style("font-weight", "bold")
		//       .text("Unemployment Rate");

		//   //draws lines and appends line element to data object.

		//   svg.append("g")
		//       .attr("class", "cities")
		//     .selectAll("path")
		//       .data(cities)
		//     .enter().append("path")
		//       .attr("d", function(d) { d.line = this;return line(d.values); });

		//   var focus = svg.append("g")
		//       .attr("transform", "translate(-100,-100)")
		//       .attr("class", "focus");

		//   //creates focus dot on line

		//   focus.append("circle")
		//       .attr("r", 3.5);

		//   //Adds text to line. May not be needed

		//   // focus.append("text")
		//   //     .attr("y", -10);


		//   //Below is what allows lines to be highlighted

		//   var voronoiGroup = svg.append("g")
		//       .attr("class", "voronoi");

		//   voronoiGroup.selectAll("path")
		//       .data(voronoi(d3.nest()
		//           .key(function(d,i) { return x(d.date) + "," + y(d.value); })
		//           .rollup(function(v) { return v[0]; })
		//           .entries(d3.merge(cities.map(function(d) { return d.values; })))
		//           .map(function(d) { return d.values; })))
		//     .enter().append("path")
		//       .attr("d", function(d,i) { return "M" + d.join("L") + "Z"; })
		//       .datum(function(d) { return d.point; })
		//       .on("mouseover", mouseover)
		//       .on("mouseout", mouseout);

		//       //each piece of data seems to be an array of objects. They contain data for each part of the path, a point value
		//       //and the cities object

		//   // d3.select("#show-voronoi")
		//   //     .property("disabled", false)
		//   //     .on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });

		//   //Below is self explanatory

		//   function mouseover(d) {
		//     d3.select(d.city.line).classed("city--hover", true);
		//     d.city.line.parentNode.appendChild(d.city.line);
		//     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
		//     focus.select("text").text(d.city.name);
		//   }

		//   function mouseout(d) {
		//     d3.select(d.city.line).classed("city--hover", false);
		//     focus.attr("transform", "translate(-100,-100)");
		//   }
		// });

		// //Just used for formatting the data

		// function type(d, i) {
		//   if (!i) months = Object.keys(d).map(monthFormat.parse).filter(Number);
		//   var city = {
		//    	name: d.name.replace(/ (msa|necta div|met necta|met div)$/i, ""),
		//     values: null
		//   };
		//   city.values = months.map(function(m) {
		//     return {
		//       city: city,
		//       date: m,
		//       value: d[monthFormat(m)] / 100
		//     };
		//   });
		//   return city;
		// }
	},

	//graphData: data to be displayed

	//dataType: whether to display count or percent

	drawlineChart:function(graphData,dataType){
		lineChart.svg.selectAll("g").remove();
		var x = d3.scale.linear()
		    .range([0, lineChart.width]);

		var y = d3.scale.linear()
		    .range([lineChart.height, 0]);

		var color = d3.scale.category10();
		color.domain(d3.keys(graphData).filter(function(key) { return key; }));

		var color2 = d3.scale.quantize()
			.domain([1,7])
			.range(colorbrewer.Set1[7]);
		
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		//The line function must accept an array as input or it won't work ;_;
		//It creates the line

		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return y(d); });

		// var voronoi = d3.geom.voronoi()
		//     .x(function(d) { return x(d.date); })
		//     .y(function(d) { return y(d.value); })
		//     .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);


	  x.domain([0,11]);

	  //adjust the y domain based on dataType
	  if(dataType === "count"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.avgOverWeight, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.avgOverWeight, function(v) { return v; }); })
		  ]);
		}
	  else if(dataType === "percent"){
		  y.domain([
		    d3.min(graphData, function(c) { return d3.min(c.perOverWeight, function(v) { return v; }); }),
	    	d3.max(graphData, function(c) { return d3.max(c.perOverWeight, function(v) { return v; }); })
		  ]);	
	  }
	  lineChart.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + lineChart.height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", lineChart.width)
	      .attr("y", -6)
	      .style("text-anchor", "end")

	  lineChart.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")

	  var zz = 0;
	  var rect = lineChart.svg.selectAll(".graph")
	      .data(graphData)
	    .enter().append("g")
	      .attr("class", "g")

	      var focus = lineChart.svg.append("g")
		      .attr("transform", "translate(-100,-100)")
		      .attr("class", "focus");

		  //creates focus dot on line

		  focus.append("circle")
		      .attr("r", 3.5);

	    //draws best fit line

	    rect.append("path")
		      .attr("class", "line")
		      .attr("d", function(d) { if(dataType === "count"){return line(d.avgOverWeight);} else{return line(d.perOverWeight);} }) //Must be passed an array
		      .style("stroke", function(d) { return color2(parseInt(d.funcCode[0])); })
			  .on("mouseover",function(d) {
			  		$(this).attr('opacity',0.5);
			  		$('#map_station_'+d.stationId).attr('stroke-width','2px');
			  		$('#map_station_'+d.stationId).attr('stroke','yellow');
			  		var info =  "<p class="+d.stationId+">Station: " +d.stationId+
									"<br>Class: "+d.funcCode+
									"</p>";
					//focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
			  		$("#stationInfo").html(info);
			  	})
			  	.on("mouseout",function(d) {
			  		$('#map_station_'+d.stationId).attr('stroke-width','none');
			  		$('#map_station_'+d.stationId).attr('stroke','none');
			  		//focus.attr("transform", "translate(-100,-100)");
			  		$(this).attr('opacity',1);
			  		$("#stationInfo").html('');
			  	});

		// var voronoiGroup = svg.append("g")
		//       .attr("class", "voronoi");

		//   voronoiGroup.selectAll("path")
		//       .data(voronoi(d3.nest()
		//           .key(function(d,i) { return x(d) + "," + y(i); })
		//           .rollup(function(v) { return v[0]; })
		//           .entries(d3.merge(cities.map(function(d) { return d.values; })))
		//           .map(function(d) { return d.values; })))
		//     .enter().append("path")
		//       .attr("d", function(d,i) { console.log(d);return "M" + d.join("L") + "Z"; })
		      //.datum(function(d) { return d.point; })
				 //.on("mouseover", mouseover)
		      	 //.on("mouseout", mouseout);

		//   function mouseover(d) {
		//     d3.select(d.city.line).classed("city--hover", true);
		//     d.city.line.parentNode.appendChild(d.city.line);
		//     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
		//     focus.select("text").text(d.city.name);
		//   }

		//   function mouseout(d) {
		//     d3.select(d.city.line).classed("city--hover", false);
		//     focus.attr("transform", "translate(-100,-100)");
		//   }
		// });


		// //draws dots

		// rect.selectAll("rect")
	 //      .data(function(d) { if(dataType === "count"){return d.avgOverWeight;} else{ return d.perOverWeight} })
		// .enter().append("circle")
		// 	  .attr("class","dot")
		// 	  .attr("r", 3.5)
		// 	  .attr("cx", function(d,i) { return x(i); })
		// 	  .attr("cy", function(d) { return y(d); })
		//       .style("fill", function() {zz++;return color(Math.floor((zz-1)/12)); });

		
	},
}