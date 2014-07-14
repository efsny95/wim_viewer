var AADTGraph ={
	svg:{},
	

	initAADTGraph:function(elem){

		AADTGraph.margin = {top: 5, right: 5, bottom: 10, left:50},
		AADTGraph.width = parseInt($(elem).width()) - AADTGraph.margin.left - AADTGraph.margin.right,
		AADTGraph.height = parseInt($(elem).width()*0.75) - AADTGraph.margin.top - AADTGraph.margin.bottom;

		AADTGraph.svg = d3.select(elem).append("svg")
		    .attr("width", AADTGraph.width + AADTGraph.margin.left + AADTGraph.margin.right)
		    .attr("height", AADTGraph.height + AADTGraph.margin.top + AADTGraph.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + AADTGraph.margin.left + "," + AADTGraph.margin.top + ")");

	},
	/*

	The draw graph function has the following parameter conditions:
	graphData: Data to by organized in graph
	classT: set this flag to the string class when you want to display class data
	
	PST: These four boolean flags are used in conjunction with the kind of data
	you wish to display. The first element is used if you want to display the total data.
	the second element is used for passenger data. The third element is used for single
	value data. The last element is used for Tractor trailer data
	
	year: Year is meant to accept an array of at most size two. If this parameter
	is left empty(undefined) than the code will run as normal. If the first
	element is given a two character string that represents a year(such as 09
	or 11) then the code will only display data for that specific year. If the
	second element of the array exists and it is a valid year, and the given data
	has station data for both year[0] and year[1] then the displayed graph will
	be based off of the total change between the two.

	

	*/



	drawAADTGraph:function(graphData,classT,PST,year){


	/*Below Block of code is used for making a graph that displays data based on year*/


		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, AADTGraph.width], 0.1);

		var y = d3.scale.linear()
		    .rangeRound([AADTGraph.height, 0]);

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

		The following block of code is used to organize the input data based on the flags
		given in the PST array and whether data for a specific year or a data comparison
		for two specific years should be done.

		*/

		for(var z = 0;z<graphData.length;z++){
			if(PST != undefined){
				if(PST[1] || PST[0]){
					if( year.length == 0 || year == undefined){
						graphData[z].AAPT = totalAADT(graphData[z].years,"APT")
					}
					else{
						for(var count = 0;count<graphData[z].years.length;count++){
							if(graphData[z].years[count].year === year[0]){
								temp = graphData[z].years[count].APT
								flagA = true			
							}

							if(year.length > 1){
								if(graphData[z].years[count].year === year[1]){
									graphData[z].AAPT = graphData[z].years[count].APT
									flagB = true
								}
							}
						}
						if(flagA && flagB){
							graphData[z].AAPT = temp - graphData[z].AAPT
							graphData[z].AAPT = graphData[z].AAPT/temp
							graphData[z].AAPT = graphData[z].AAPT * 100
						}
						else{
							graphData[z].AAPT = temp
						}
					}
				}
				if(PST[2] || PST[0]){
					flagA = false
					flagB = false
					if( year == undefined || year.length == 0){
						graphData[z].AASU = totalAADT(graphData[z].years,"ASU")
					}
					else{
						for(var count = 0;count<graphData[z].years.length;count++){
							if(graphData[z].years[count].year === year[0]){
								temp = graphData[z].years[count].ASU
								flagA = true			
							}

							if(year.length > 1){
								if(graphData[z].years[count].year === year[1]){
									graphData[z].AASU = graphData[z].years[count].ASU
									flagB = true
								}
							}
						}
						if(flagA && flagB){
							graphData[z].AASU = temp - graphData[z].AASU
							graphData[z].AASU = graphData[z].AASU/temp
							graphData[z].AASU = graphData[z].AASU * 100
						}
						else{
							graphData[z].AASU = temp
						}
					}
				}
				if(PST[3] || PST[0]){
					flagA = false
					flagB = false
					if( year == undefined || year.length == 0){
						graphData[z].AATT = totalAADT(graphData[z].years,"ATT")
					}
					else{
						for(var count = 0;count<graphData[z].years.length;count++){
							if(graphData[z].years[count].year === year[0]){
								temp = graphData[z].years[count].ATT
								flagA = true			
							}

							if(year.length > 1){
								if(graphData[z].years[count].year === year[1]){
									graphData[z].AATT = graphData[z].years[count].ATT
									flagB = true
								}
							}
						}
						if(flagA && flagB){
							graphData[z].AATT = temp - graphData[z].AATT
							graphData[z].AATT = graphData[z].AATT/temp
							graphData[z].AATT = graphData[z].AATT * 100
						}
						else{
							graphData[z].AATT = temp
						}
					}
				}
			}
			graphData[z].heights[0].y1 = graphData[z].AAPT	
			graphData[z].heights[1].y0 = graphData[z].heights[0].y1
			graphData[z].heights[1].y1 = graphData[z].heights[0].y1 + graphData[z].AASU	
			graphData[z].heights[2].y0 = graphData[z].heights[1].y1
			graphData[z].heights[2].y1 = graphData[z].heights[1].y1 + graphData[z].AATT	
			
		}
		graphData.sort(compareStations); 
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		y.domain([0, d3.max(graphData, function(d,i) { return graphData[i].heights[2].y1; })]);
		//y.domain(d3.extent(function(d,i) { return graphData[i].heights[2].y1; })).nice();


	    AADTGraph.svg.selectAll("g").remove();

		AADTGraph.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		//Below clears out previous graph data

		var rect2 =AADTGraph.svg.selectAll("rect")
				 rect2.remove();
		
		//Below is where color functions are created for coloring the bars

		var colorP = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) {  return graphData[i].AAPT; }), d3.max(graphData, function(d,i) { return graphData[i].AAPT; })])
	        .range(colorbrewer.RdYlGn[11]);
	    var colorS = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) {  return graphData[i].AASU; }), d3.max(graphData, function(d,i) { return graphData[i].AASU; })])
	        .range(colorbrewer.RdYlGn[11]);
	    var colorT = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return graphData[i].AATT; }), d3.max(graphData, function(d,i) { return graphData[i].AATT; })])
	        .range(colorbrewer.RdYlGn[11]);

		var rect = AADTGraph.svg.selectAll(".graph")
	      .data(graphData)
	    .enter().append("g")
	      .attr("class", "g")
			  	
	    rect.selectAll("rect")
	      .data(function(d) { return d.heights; })
	    .enter().append("rect")
			  	.attr("class","enter")
			  	//Below is where bar is displayed on x axis
			  	.attr("x", function(d,i) { if(i==0){++zz;}; return x(graphData[zz-1].stationId); })
			  	//Below is the width of the bar
			  	.attr("width", x.rangeBand())
			  	//Below two values are used to set the height of the bar and make sure it displays upside down properly
				.attr("y", function(d,i) { if(d.y1 == 0){return 0}; return y(Math.max(0,d.y1)); })
			  	.attr("height", function(d,i) {zz = 0; return Math.abs(y(d.y0) - y(d.y1)); })
			  	//Below is used to set the color of the bar based on the data being examined.
			  	.attr("style", function(d,i,zz) { 
			  		if(i==0){return  "fill:"+colorP(graphData[zz].AAPT)+";";}
			  		else if(i==1){return  "fill:"+colorS(graphData[zz].AASU)+";";}
			  		else {return  "fill:"+colorT(graphData[zz].AATT)+";";} 
			  	})
			  	.on("click",function(d,i,zz) { window.location ="#/station/class/"+ graphData[zz].stationId; })
			  	.on("mouseover",function(d,i,zz) {
			  		$(this).attr('opacity',0.5);
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke-width','2px');
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke','yellow');
			  		if(classT !== "class"){
				  		var info =  "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
									"<br> Number of years of data: "+graphData[i].years.length+
									"<br>ACompleteness: "+totalAADT(graphData[i].years,"percent")+
									"<br>AAADT: "+totalAADT(graphData[i].years)+
									"</p>";
					}
					else{
						var info = "<p class="+graphData[zz].stationId+">Station: " +graphData[zz].stationId;
						if(year == undefined || year.length == 0){
							info = info+"<br> Number of years of data: "+graphData[zz].years.length
						}
						else if(year.length == 1){
							info = info+"<br> Year of data: 20"+year[0]
						}
						else{
							info = info+"<br> Years compared: "+year[0] + " VS " + year[1]
						}
						info = info +"<br> ADT: "+totalAADT(graphData[zz].years,"class");
						if(i == 0){
							info = info+"<br> APT: "+graphData[zz].AAPT+"</p>"
						}
						else if(i == 1){
							info = info+"<br> ASU: "+graphData[zz].AASU+"</p>"
						}
						else{
							info = info+"<br> ATT: "+graphData[zz].AATT+"</p>"
						}

					}

			  		$("#stationInfo").html(info);
			  		//$("#stationInfo").show();
			  	})
			  	.on("mouseout",function(d,i,zz) {
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke-width','none');
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke','none');
			  		$(this).attr('opacity',1);
			  		$("#stationInfo").html('');
			  		//$("#stationInfo").hide();
			  	});
		
		//Collects various forms of average trafic data.

		function totalAADT(arr,check){
			var total = 0;

			for(var i = 0;i<arr.length;i++){
				if(check === "APT"){total = total+arr[i].APT}
				else if(check === "ASU"){total = total+arr[i].ASU}
				else if(check === "ATT"){total = total+arr[i].ATT}
				else if(check === "class"){total = total+arr[i].ADT}	
				else if(classT === "class"){total = total + arr[i].ADT;}
				else if(typeof check === 'undefined'){ total = total + arr[i].AADT; }
				else{ total = total + arr[i].percent; }
			}

			total = total / arr.length;
			return total;
		}

		//Is used by the sorting function to sort given values
		
		function compareStations(a, b) {
	      if((a.heights[2].y1 < 0) && (b.heights[2].y1 < 0) ){
	      	return (-1 * a.heights[2].y1) - (-1 * b.heights[2].y1);
	      }
	      else if(b.heights[2].y1 < 0){
	      	return a.heights[2].y1 - (-1* b.heights[2].y1);
	      }
	      else if(a.heights[2].y1 < 0){
	      	return (-1 * a.heights[2].y1) - b.heights[2].y1;
	      }
	      else{
		  	return a.heights[2].y1 - b.heights[2].y1;
		  }
		}	
	},




	/*Below block of code is for measuring average weight of class over time*/

	/*

	The draw graph function has the following parameter conditions:
	graphData: Data to by organized in graph
	classT: set this flag to the string class when you want to display class data
	truckClass: Class of truck data. Is 0 when not in use.

	*/

	drawAADTGraphWeight:function(graphData,classT,truckClass){


		//console.log('graphData',graphData);

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, AADTGraph.width], 0.1);

		var y = d3.scale.linear()
		    .rangeRound([AADTGraph.height, 0]);

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
		AADTGraph.graphData = graphData;
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		y.domain([0, d3.max(graphData, function(d,i) { return Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour")); })]);

		var color = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour")); }), d3.max(graphData, function(d,i) { return Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour")); })])
	        .range(colorbrewer.RdYlGn[11]);

	    AADTGraph.svg.selectAll("g").remove();

		AADTGraph.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		var rect =AADTGraph.svg.selectAll("rect");
			rect.remove();
			rect =AADTGraph.svg.selectAll("rect")
		  		.data(graphData);
		rect.enter().append("rect")
		  	.attr("class","enter")
		  	.attr("x", function(d,i) { return x(graphData[i].stationId); })
		  	.attr("width", x.rangeBand())
		  	.attr("y", function(d,i) { return y(Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour"))); })
		  	.attr("style", function(d,i) { return  "fill:"+color(Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour")))+";"; })
		  	.attr("height", function(d,i) { return AADTGraph.height - y(Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour"))); })
		  	.on("click",function(d,i) { window.location ="/station/wim/"+ graphData[i].stationId; })
		  	.on("mouseover",function(d,i) {
		  		$(this).attr('opacity',0.5);
		  		$('#map_station_'+graphData[i].stationId).attr('stroke-width','2px');
		  		$('#map_station_'+graphData[i].stationId).attr('stroke','yellow');
			  		var info =  "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
								"<br> Number of years of data: "+graphData[i].years.length+
								"<br> Class: "+ truckClass +
								"<br>AWeight/time: "+Math.round(totalAADT(graphData[i].years,classT)/totalAADT(graphData[i].years,"hour"))+
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

		function totalAADT(arr,check){
			var total = 0;

			for(var i = 0;i<arr.length;i++){
				if(check === "weight"){ total = total + parseInt(arr[i].Weight)}
				else if(check === "hour"){total = total + parseInt(arr[i].hours)}
			}
			if(check != "hour"){
				total = Math.round(total / arr.length);
			}
			return total;
		}

		//Is used by the sorting function to sort given values
		
		function compareStations(a, b) {
			return Math.round(totalAADT(a.years,classT)/totalAADT(a.years,"hour")) - Math.round(totalAADT(b.years,classT)/totalAADT(b.years,"hour"))
		}	
	}



			 
}