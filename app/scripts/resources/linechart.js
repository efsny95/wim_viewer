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
			.range(colorbrewer.RdYlGn[11]);
		
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


	  x.domain([0,11]);

	  //adjust the y domain based on dataType
	  if(dataType === "count"){
		  y.domain([
			    d3.min(graphData, function(c) { return d3.min(c.avgOverWeight, function(v) { return v; }); }),
	    		d3.max(graphData, function(c) { return d3.max(c.avgOverWeight, function(v) { return v; }); })
		  ]);
		}
	  else{
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
			  		$("#stationInfo").html(info);
			  	})
			  	.on("mouseout",function(d) {
			  		$('#map_station_'+d.stationId).attr('stroke-width','none');
			  		$('#map_station_'+d.stationId).attr('stroke','none');
			  		$(this).attr('opacity',1);
			  		$("#stationInfo").html('');
			  	});


		//draws dots

		rect.selectAll("rect")
	      .data(function(d) { if(dataType === "count"){return d.avgOverWeight;} else{ return d.perOverWeight} })
		.enter().append("circle")
			  .attr("class","dot")
			  .attr("r", 3.5)
			  .attr("cx", function(d,i) { return x(i); })
			  .attr("cy", function(d) { return y(d); })
		      .style("fill", function() {zz++;return color(Math.floor((zz-1)/12)); });
		
	},
}