(function() {
	var wim = {
		version: "0.0.1"
	};

	function _WIMGrapher(id) {
		var self = this,
			formattedData = [],
			depth = [0],
			stationID,
			clicked = false,

			route = 'http://localhost:1337/stations/graphData/';

		var time = {
			1: 'year',
			2: 'month',
			3: 'day',
			4: 'hour'
		}
		// initialize graph div
		var graphDIV = d3.select(id),
		// initialize measurements
			navBarWidth = 70,

			margin = {top: 5, right: 5, bottom: 25, left: 80},
			width = parseInt(graphDIV.style('width'))-navBarWidth-margin.right,
			height = parseInt(graphDIV.style('height')),

			wdth = width - margin.left - margin.right,
		    hght = height - margin.top - margin.bottom,
		// initialize SVG
			SVG = graphDIV.append('svg')
				.attr('width', width + 'px')
				.attr('height', height + 'px'),
		// create graph SVG group
			graphSVG = SVG.append('g')
				.attr("transform", "translate("+margin.left+", "+margin.top+")"),
		// initialize nav bar div
			navBar = graphDIV.append('div')
				.attr('id', 'navBar')
				.style('right', margin.right +'px')
				.style('top', margin.top+'px')
				.style('width', navBarWidth+'px');
	    // initialize x scale and axis
	    var Xscale = d3.scale.ordinal()
	    	.rangePoints([0, wdth]);

	    var Xaxis = d3.svg.axis()
	    		.scale(Xscale)
	    		.orient('bottom');

	    graphSVG.append('g')
	    	.attr('class', 'x-axis')
	        .attr('transform', 'translate(0, '+(height - margin.top - margin.bottom)+')');
	    // initialize y scale and axis
	   	var Yscale = d3.scale.linear()
	   		.range([hght, 0]);

	    var Yaxis = d3.svg.axis()
	    		.scale(Yscale)
	    		.orient('left');

	    graphSVG.append('g')
	    	.attr('class', 'y-axis');

		function _getData() {
            d3.xhr(route + stationID)
                .response(function(request) {
                    return JSON.parse(request.responseText);
                })
                .post(JSON.stringify({'depth': depth}), function(error, data) {
                	if (error) {
                		console.log(error);
                		return;
                	}
                	var tm = time[depth.length];

                	_drawGraph(_formatData(data, tm), tm);
                });
		}

		function _formatData(data, time) {
			var schema = [];
			for (var i in data.schema.fields) {
				schema.push(data.schema.fields[i].name)
			}
			formattedData = [];
			for (var i in data.rows) {
				var obj = {};
				for (var j in schema) {
					obj[schema[j]] = +data.rows[i].f[j].v;
				}
				formattedData.push(obj);
			}
			return _combineClasses(_sortBy(formattedData, time), time);
		}

		function _combineClasses(data, attr) {
			var reduced = [],
				cur = data.pop(),
				obj = {};

			obj.amount = cur.amount;
			obj[attr] = cur[attr];

			while (data.length) {
				cur = data.pop();
				if (obj[attr] === cur[attr]) {
					obj.amount += cur.amount;
				} else {
					reduced.push(obj);
					obj = {};
					obj.amount = cur.amount;
					obj[attr] = cur[attr];
				}
			}
			reduced.push(obj);

			return _sortBy(reduced, attr);
		}

		function _sortBy(array, attr) {
			return array.sort(function(a, b) {
				return a[attr] - b[attr];
			})
		}

		function _drawGraph(data, time) {
		    var Xmin = Xmax = data[0][time];
		    var Ymin = Ymax = data[0].amount;
		    var ticks = [];

		    data.forEach(function(d) {
		    	if (d[time] > Xmax) {
		    		Xmax = d[time];
		    	} else if (d[time] < Xmin) {
		    		Xmin = d[time];
		    	}
		    	if (d.amount > Ymax) {
		    		Ymax = d.amount;
		    	} else if (d.amount < Ymin) {
		    		Ymin = d.amount;
		    	}
		    	ticks.push(Math.round(d[time]));
		    });

		   	var barWidth = Math.min(wdth / data.length, 75),
		   		space = wdth - (barWidth * data.length);
		   		gap = space / (data.length+1);;

		   	var padding = (2*gap + barWidth) / (gap + barWidth);

		    Xscale.domain(ticks)
		    	.rangePoints([0, wdth], padding);

		    var Ymax = d3.max(data, function(d) { return d.amount; });

		   	Yscale.domain([0, Ymax]);

			var bars = graphSVG.selectAll('rect')
				.data(data);

			bars
		        .transition()
				.duration(500)
		        .attr('x', function(d, i) { return i*(barWidth + gap) + gap; })
		        .attr('y', function(d) { return Yscale(d.amount); })
				.attr('height', function(d) { return hght - Yscale(d.amount); })
		        .attr('width', barWidth)

			bars.enter().append('rect')
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('stroke-width', 1)
		        .attr('stroke', '#eef')
		        .attr('fill', '#44b')
				.transition()
		    	.duration(500)
		    	//.delay(function(d, i) { return i * (300/data.length) + 1000; })
		    	.attr('height', function(d) { return hght - Yscale(d.amount); })
		        .attr('width', barWidth)
		        .attr('x', function(d, i) { return i*(barWidth + gap) + gap; })
		        .attr('y', function(d) { return Yscale(d.amount); })
		        .attr('fill', '#4b4');

		    bars.on('mouseover', function(d) {
		        	d3.select(this)
				        .attr('fill', '#5d5');
		        })
		        .on('mouseout', function(d) {
		        	d3.select(this)
				        .attr('fill', '#4b4');
		        })
		        .on('click', function(d) {
					if (!clicked && depth.length < 4) {
						clicked = true;
						depth.push(d[time]);
						_getData();
					}
					d3.event.stopPropagation();
				});

			bars.exit()
		    	.transition()
		    	.duration(500)
		    	.attr('fill', '#44b')
				.attr('y', hght +'px')
				.attr('height', 0)
		    	.remove();

		    Xaxis.tickValues(ticks);

		    var t = graphSVG.transition().duration(500);

		    t.select('.x-axis').call(Xaxis)
		    t.select('.y-axis').call(Yaxis);

		    _drawNavigator(time);

		    clicked = false;
		}

		function _drawNavigator(time) {
			var buttons = navBar.selectAll('a')
				.data(depth);

			buttons.enter().append('a');

			buttons.exit().remove();

			buttons.text(_getNavBarText)
				.on('click', function(d, i) {
					if (!clicked && i+1 < depth.length) {
						clicked = true;
						while (depth.length-1 > i) {
							depth.pop();
						}
						_getData();
					}
				});
		}
		var _months = {
			1: 'Jan.',
			2: 'Feb.',
			3: 'Mar.',
			4: 'Apr.',
			5: 'May',
			6: 'June',
			7: 'July',
			8: 'Aug.',
			9: 'Sep.',
			10: 'Oct.',
			11: 'Nov.',
			12: 'Dec.'
		}
		function _getNavBarText(d, i) {
			switch(i) {
				case 0:
					return 'Root'
				case 1:
					return '20' + d;
				case 2:
					return _months[d];
				case 3:
					return _getSuffix(d);
			}
		}
		function _getSuffix(d) {
			if (/[^1]1$|^1$/.test(d))
				return d+'st';
			if (/[^1]2$|^2$/.test(d))
				return d+'nd';
			if (/[^1]3$|^3$/.test(d))
				return d+'rd';

			return d+'th';
		}

		self.drawGraph = function(station) {
			stationID = station;
			_getData();
		}
	}

	wim.grapher = function(id) {
		return new _WIMGrapher(id);
	}

	this.wim = wim;
})()