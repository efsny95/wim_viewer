//Quick sort thanks to: http://en.literateprograms.org/Quicksort_(JavaScript)


 function swap(a, b,c)
		{
			var tmp=c[a];
			c[a]=c[b];
			c[b]=tmp;
			return c
		}

var barGraph ={

	initBarGraph:function(){

		var margin = {top: 20, right: 20, bottom: 30, left: 40},
		    width = 1000 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var svg = d3.select("#barGraph").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		 return svg;

	},

	drawBarGraph:function(graphData,svg){

		var margin = {top: 20, right: 20, bottom: 30, left: 40},
		    width = 1000 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    //.ticks(10, "%");
		qsort(graphData,0,graphData.length)
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		y.domain([0, d3.max(graphData, function(d,i) { return totalAADT(graphData[i].years); })]);

		var color = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return totalAADT(graphData[i].years); }), d3.max(graphData, function(d,i) { return totalAADT(graphData[i].years); })])
	        .range(colorbrewer.RdYlGn[11]);

	    svg.selectAll("g").remove();

		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		var rect =svg.selectAll("rect");
			rect.remove();
			rect =svg.selectAll("rect")
		  		.data(graphData);
		rect.enter().append("rect")
		  	.attr("class","enter")
		  	.attr("x", function(d,i) { return x(graphData[i].stationId); })
		  	.attr("width", x.rangeBand())
		  	.attr("y", function(d,i) { return y(totalAADT(graphData[i].years)); })
		  	.attr("style", function(d,i) { return  "fill:"+color(totalAADT(graphData[i].years))+";"; })
		  	.attr("height", function(d,i) { return height - y(totalAADT(graphData[i].years)); })
		  	.on("click",function(d,i) { window.location ="#/station/wim/"+ graphData[i].stationId; })
		  	.on("mouseover",function(d,i) {$("#stationInfo").append("<p class="+graphData[i].stationId+">Station: "+graphData[i].stationId+"<br> Number of years of data: "+graphData[i].years.length+" <br>ACompleteness: "+totalAADT(graphData[i].years,"percent")+" <br>AAADT: "+totalAADT(graphData[i].years)+"</p>");})
		  	.on("mouseout",function(d,i) {$("."+graphData[i].stationId).remove();});
		
		  

		function totalAADT(arr,check){
			var total = 0;

			for(var i = 0;i<arr.length;i++){
				if(check == undefined){
					total = total + arr[i].AADT;
				}
				else{
					total = total + arr[i].percent;	
				}
			}
			total = total / arr.length
			return total;
		}
		
		function partition(array, begin, end, pivot)
		{
			var piv=totalAADT(array[pivot].years);
			array = swap(pivot, end-1,array);
			var store=begin;
			var ix;
			for(ix=begin; ix<end-1; ++ix) {
				if(totalAADT(array[ix].years)<=piv) {
					array = swap(store, ix,array);
					++store;
				}
			}
			array = swap(end-1, store,array);

			return store;
		}


		function qsort(array, begin, end)
		{
			if(end-1>begin) {
				var pivot=begin+Math.floor(Math.random()*(end-begin));

				pivot=partition(array, begin, end, pivot);

				qsort(array, begin, pivot);
				qsort(array, pivot+1, end);
			}
		}

		
	}


}