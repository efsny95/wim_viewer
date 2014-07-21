var monthlyLineChart = {
	
	svg:{},

	initMonthlylLineChart:function(elem){
		monthlyLineChart.margin = {top: 5, right: 5, bottom: 10, left:50},
		monthlyLineChart.width = parseInt($(elem).width()) - monthlyLineChart.margin.left - monthlyLineChart.margin.right,
		monthlyLineChart.height = parseInt($(elem).width()*0.75) - monthlyLineChart.margin.top - monthlyLineChart.margin.bottom;

		monthlyLineChart.svg = d3.select(elem).append("svg")
		    .attr("width", monthlyLineChart.width + monthlyLineChart.margin.left + monthlyLineChart.margin.right)
		    .attr("height", monthlyLineChart.height + monthlyLineChart.margin.top + monthlyLineChart.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + monthlyLineChart.margin.left + "," + monthlyLineChart.margin.top + ")");
	},

	//graphData: data to be displayed

	//dataType: type of traffic being displayed

	drawMonthlyLineChart:function(graphData,dataType){
		monthlyLineChart.svg.selectAll("g").remove();
		var x = d3.scale.linear()
		    .range([0, monthlyLineChart.width]);

		var y = d3.scale.linear()
		    .range([monthlyLineChart.height, 0]);

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

		    
		//graphData.sort(compareStations); 

	  x.domain([0,11]);

	  //adjust the y domain based on dataType
	  if(dataType === "All"){
	  
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.monthsAll, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.monthsAll, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "APT"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.monthsAPT, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.monthsAPT, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "ASU"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.monthsASU, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.monthsASU, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "ATT"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.monthsATT, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.monthsATT, function(v) { return v; }); })
		  ]);
	  }

		
	 
	  monthlyLineChart.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + monthlyLineChart.height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", monthlyLineChart.width)
	      .attr("y", -6)
	      .style("text-anchor", "end")

	  monthlyLineChart.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")

	  var zz = 0;
	  var rect = monthlyLineChart.svg.selectAll(".graph")
	      .data(graphData)
	    .enter().append("g")
	      .attr("class", "g")

	   //    var focus = monthlyLineChart.svg.append("g")
		  //     .attr("transform", "translate(-100,-100)")
		  //     .attr("class", "focus");

		  // //creates focus dot on line

		  // focus.append("circle")
		  //     .attr("r", 3.5);

	    //draws best fit line

	    rect.append("path")
		      .attr("class", "line")
		      .attr("d", function(d) { if(dataType === "All"){return line(d.monthsAll);} else if(dataType === "APT"){return line(d.monthsAPT);} else if(dataType === "ASU"){return line(d.monthsASU);} else if(dataType === "ATT"){return line(d.monthsATT);} }) //Must be passed an array
		      .style("stroke", function(d) { return color2(parseInt(d.funcCode[0])); })
			  .on("mouseover",function(d) {
			  		$(this).attr('opacity',0.5);
			  		$('#map_station_'+d.stationId).attr('stroke-width','2px');
			  		$('#map_station_'+d.stationId).attr('stroke','yellow');
			  		var info =  "<p class="+d.stationId+">Station: " +d.stationId+
									"<br>Class: "+dataType+
									"<br>Class Code: "+d.funcCode+
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


		//draws dots

		rect.selectAll("rect")
	      .data(function(d) { if(dataType === "All"){return d.monthsAll;} else if(dataType === "APT"){return d.monthsAPT;} else if(dataType === "ASU"){return d.monthsASU;} else if(dataType === "ATT"){return d.monthsATT;} })
		.enter().append("circle")
			  .attr("class","dot")
			  .attr("r", 3.5)
			  .attr("cx", function(d,i) { return x(i); })
			  .attr("cy", function(d) { return y(d); })
		      .style("fill", function() {zz++;return color(Math.floor((zz-1)/12)); });

		
	},

	//Below is the function for drawing hourly data

	drawHourlyLineChart:function(graphData,dataType){
		monthlyLineChart.svg.selectAll("g").remove();
		var x = d3.scale.linear()
		    .range([0, monthlyLineChart.width]);

		var y = d3.scale.linear()
		    .range([monthlyLineChart.height, 0]);

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

		    
		//graphData.sort(compareStations); 

	  x.domain([0,23]);

	  //adjust the y domain based on dataType
	  if(dataType === "All"){
	  
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.hoursAll, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.hoursAll, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "APT"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.hoursAPT, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.hoursAPT, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "ASU"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.hoursASU, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.hoursASU, function(v) { return v; }); })
		  ]);
	  }
	  else if(dataType === "ATT"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.hoursATT, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.hoursATT, function(v) { return v; }); })
		  ]);
	  }

		
	 
	  monthlyLineChart.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + monthlyLineChart.height + ")")
	      .call(xAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("x", monthlyLineChart.width)
	      .attr("y", -6)
	      .style("text-anchor", "end")

	  monthlyLineChart.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")

	  var zz = 0;
	  var rect = monthlyLineChart.svg.selectAll(".graph")
	      .data(graphData)
	    .enter().append("g")
	      .attr("class", "g")

	   //    var focus = monthlyLineChart.svg.append("g")
		  //     .attr("transform", "translate(-100,-100)")
		  //     .attr("class", "focus");

		  // //creates focus dot on line

		  // focus.append("circle")
		  //     .attr("r", 3.5);

	    //draws best fit line

	    rect.append("path")
		      .attr("class", "line")
		      .attr("d", function(d) { if(dataType === "All"){return line(d.hoursAll);} else if(dataType === "APT"){return line(d.hoursAPT);} else if(dataType === "ASU"){return line(d.hoursASU);} else if(dataType === "ATT"){return line(d.hoursATT);} }) //Must be passed an array
		      .style("stroke", function(d) { return color2(parseInt(d.funcCode[0])); })
			  .on("mouseover",function(d) {
			  		$(this).attr('opacity',0.5);
			  		$('#map_station_'+d.stationId).attr('stroke-width','2px');
			  		$('#map_station_'+d.stationId).attr('stroke','yellow');
			  		var info =  "<p class="+d.stationId+">Station: " +d.stationId+
									"<br>Class: "+dataType+
									"<br>Class Code: "+d.funcCode+
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


		//draws dots

		rect.selectAll("rect")
	      .data(function(d) { if(dataType === "All"){return d.hoursAll;} else if(dataType === "APT"){return d.hoursAPT;} else if(dataType === "ASU"){return d.hoursASU;} else if(dataType === "ATT"){return d.hoursATT;} })
		.enter().append("circle")
			  .attr("class","dot")
			  .attr("r", 3.5)
			  .attr("cx", function(d,i) { return x(i); })
			  .attr("cy", function(d) { return y(d); })
		      .style("fill", function() {zz++;return color(Math.floor((zz-1)/24)); });

		
	},

}