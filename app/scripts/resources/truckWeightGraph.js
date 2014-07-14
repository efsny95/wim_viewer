var truckWeightGraph = {
	
	svg:{},
	

	initTruckWeightGraph:function(elem){

		truckWeightGraph.margin = {top: 5, right: 5, bottom: 10, left:50},
		truckWeightGraph.width = parseInt($(elem).width()) - truckWeightGraph.margin.left - truckWeightGraph.margin.right,
		truckWeightGraph.height = parseInt($(elem).width()*0.75) - truckWeightGraph.margin.top - truckWeightGraph.margin.bottom;

		truckWeightGraph.svg = d3.select(elem).append("svg")
		    .attr("width", truckWeightGraph.width + truckWeightGraph.margin.left + truckWeightGraph.margin.right)
		    .attr("height", truckWeightGraph.height + truckWeightGraph.margin.top + truckWeightGraph.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + truckWeightGraph.margin.left + "," + truckWeightGraph.margin.top + ")");

	},

	/*

	graphData: Data to be displayed

	orderType: Whether graph should be orderer by percent or count

	displayType: What is being displayed(year, month, day). Only used in hover string.

	*/

	drawTruckWeightGraph:function(graphData,orderType,displayType){



		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, truckWeightGraph.width], 0.1);

		var y = d3.scale.linear()
		    .rangeRound([truckWeightGraph.height,0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		var temp = 0
		var flagA = false
		var flagB = false
		var zz = 0;

		/*

		

		*/
		
		graphData.sort(compareStations); 
		truckWeightGraph.graphData = graphData;
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		if(orderType === "count"){
			y.domain([0, d3.max(graphData, function(d,i) { return average(graphData[i].years,"overweight"); })]);
		
		

		var color = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return average(graphData[i].years,"overweight"); }), d3.max(graphData, function(d,i) { return average(graphData[i].years,"overweight"); })])
	        .range(colorbrewer.RdYlGn[11]);

	    truckWeightGraph.svg.selectAll("g").remove();

		truckWeightGraph.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		var rect =truckWeightGraph.svg.selectAll("rect");
			rect.remove();
			rect =truckWeightGraph.svg.selectAll("rect")
		  		.data(graphData);
		rect.enter().append("rect")
		  	.attr("class","enter")
		  	.attr("x", function(d,i) { return x(graphData[i].stationId); })
		  	.attr("width", x.rangeBand())
		  	.attr("y", function(d,i) { return y(average(graphData[i].years,"overweight")); })
		  	.attr("style", function(d,i) { return  "fill:"+color(average(graphData[i].years,"overweight"))+";"; })
		  	.attr("height", function(d,i) { if(truckWeightGraph.height - y(average(graphData[i].years,"overweight")) == 0){return 1}; return truckWeightGraph.height - y(average(graphData[i].years,"overweight")); });
		}
		else{
			y.domain([0, d3.max(graphData, function(d,i) { return average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100; })]);	
		var color = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100; }), d3.max(graphData, function(d,i) { return average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100; })])
	        .range(colorbrewer.RdYlGn[11]);

	    truckWeightGraph.svg.selectAll("g").remove();

		truckWeightGraph.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		var rect =truckWeightGraph.svg.selectAll("rect");
			rect.remove();
			rect =truckWeightGraph.svg.selectAll("rect")
		  		.data(graphData);
		rect.enter().append("rect")
		  	.attr("class","enter")
		  	.attr("x", function(d,i) { return x(graphData[i].stationId); })
		  	.attr("width", x.rangeBand())
		  	.attr("y", function(d,i) { return y(average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100); })
		  	.attr("style", function(d,i) { return  "fill:"+color(average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100)+";"; })
		  	.attr("height", function(d,i) { if(truckWeightGraph.height - y(average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100) == 0){return 1}; return truckWeightGraph.height - y(average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100); });
		}

		rect.on("click",function(d,i) { window.location ="/station/wim/"+ graphData[i].stationId; })
		  	.on("mouseover",function(d,i) {
		  		$(this).attr('opacity',0.5);
		  		$('#map_station_'+graphData[i].stationId).attr('stroke-width','2px');
		  		$('#map_station_'+graphData[i].stationId).attr('stroke','yellow');
			  		var info =  "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
								"<br>Number of "+displayType+"s of data: "+graphData[i].years.length+
								"<br>Avg Num overweight trucks/year: "+average(graphData[i].years,"overweight")+
								"<br>Percent overweight: "+average(graphData[i].years,"overweight")/average(graphData[i].years,"totalTrucks") * 100 +"%"+
								"</p>";
		  		$("#stationInfo").html(info);
		  		//$("#stationInfo").show();
		  	})
		  	.on("mouseout",function(d,i) {
		  		$('#map_station_'+graphData[i].stationId).attr('stroke-width','none');
		  		$('#map_station_'+graphData[i].stationId).attr('stroke','none');
		  		$(this).attr('opacity',1);
		  		$("#stationInfo").html('');
		  		//$("#stationInfo").hide();
		  	});
		
		//Collects various forms of average trafic data.

		function average(arr,typeAVG){
			var total = 0
			for(var i = 0;i<arr.length;i++){

				if(typeAVG === "overweight"){
					total = total + parseInt(arr[i].overweightTrucks)
				}
				else if(typeAVG === "totalTrucks"){
					total = total + parseInt(arr[i].numTrucks)
				}

			}
			total = Math.round(total / arr.length)
			return total

		}


		//Is used by the sorting function to sort given values
		
		function compareStations(a, b) {
			if(orderType === "count"){
				return average(a.years,"overweight") - average(b.years,"overweight")
			}
			else if(orderType === "percent")
				return (average(a.years,"overweight")/average(a.years,"totalTrucks") * 100) - (average(b.years,"overweight")/average(b.years,"totalTrucks") * 100)
		}	
	}

}