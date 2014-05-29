(function() {
	var wimgraph = {
		version: "0.0.1"
	};

	function _WIMGrapher(id) {
		var self = this,
			formattedData = [],
			depth = [0],
			stationID,
			clicked = false,

			route = 'http://localhost:1337/stations/graphData/';

		var TIMES = {
			1: 'year',
			2: 'month',
			3: 'day',
			4: 'hour'
		},
			time = null;

		// initialize graph div
		var graphDIV = d3.select(id).append('div')
			.attr('id', 'graphDIV'),
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
				.attr('class', 'navBar')
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
	   		.rangeRound([hght, 0])
	   		.clamp(true);

	    var Yaxis = d3.svg.axis()
	    		.scale(Yscale)
	    		.orient('left');

	    graphSVG.append('g')
	    	.attr('class', 'y-axis');

	    // create toggle buttons
		var groupBy = 'weight',
			reduceBy = 'class';

	    var togglesDiv = graphDIV.append('div')
	    	.attr('class', 'navBar')
			.style('right', margin.right +'px')
			.style('bottom', margin.top+'px')
			.style('width', navBarWidth+'px');

		togglesDiv.append('a')
			.text('Class')
			.classed('inactive', true)
			.on('click', _toggle)

		togglesDiv.append('a')
			.text('Weight')
			.classed('active', true)
			.on('click', _toggle)

		function _toggle() {
			var self = d3.select(this),
				active = self.classed('active');

			if (!active && !clicked) {
				clicked = true;

				togglesDiv.selectAll('a')
					.classed('active', false)
					.classed('inactive', true)
				self.classed('active', true)
					.classed('inactive', false)

				groupBy = self.text().toLowerCase();
				reduceBy = (self.text().toLowerCase() === 'class' ? 'weight' : 'class');
				_drawGraph();
			}
		}
		// create class and weight scales
		var classScale = d3.scale.ordinal()
			.domain([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
			.range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),

			weightScale = d3.scale.quantize()
			.domain([0, 140000])
			.range([0, 1, 2, 3, 4, 5, 6]),

			_CONVERT = 220.462;

		var _COLORS = {
			class: ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1","#ddffff","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],
			weight: ["#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603"]
		}

		var classFilter = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		]

		var weightFilter = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
		]

		// create legends
		var legendDIV = d3.select(id).append('div')
			.attr('id', 'legendDIV')

		var classLegend = legendDIV.append('div')
			.attr('class', 'legend')
			.style('width', (classScale.range().length*60+10)+'px')
			.style('padding-top', '5px')
			.style('padding-bottom', '5px')
			.style('height', '50px')

		var classLabels = classLegend.selectAll('a').data(classScale.range())
			.enter().append('a')
			.style('background', function(d) {
				return _COLORS.class[d];
			})
			.text(function(d) { return 'Cls '+classScale.domain()[d]})
			.on('click', function(d) {
				clicked = true;
				var self = d3.select(this)

				self.classed('inactive', !self.classed('inactive'));
				classFilter[d] = self.classed('inactive');

				if (self.classed('inactive')) {
					self.style('background', null)
				} else {
					self.style('background', function(d) {
						return _COLORS.class[d];
					})
				}

				_drawGraph()
			})
			.on('mouseover', function(d) {
				d3.selectAll('.class' + d)
					.style('opacity', 1.0)
					.attr('fill', '#d73027')
			})
			.on('mouseout', function(d) {
				d3.selectAll('.class' + d)
					.style('opacity', 0.75)
					.attr('fill', function() { return _COLORS.class[d]; })
			})

		var weightLegend = legendDIV.append('div')
			.attr('class', 'legend')
			.style('width', ((weightScale.range().length)*100+10)+'px')
			.style('text-align', 'left')

		var weightLabels = weightLegend.selectAll('a').data(weightScale.range())
			.enter().append('a')
			.style('background', function(d) {
				return _COLORS.weight[d];
			})
			.style('width', '100px')
			.text(function(d, i) {
				var text = '0 lbs.';
				if (i > 0) {
					text = (i*20).toString() + 'k lbs.';
				}
				return text;
			})
			.on('click', function(d) {
				clicked = true;
				var self = d3.select(this)

				self.classed('inactive', !self.classed('inactive'));
				weightFilter[d] = self.classed('inactive');

				if (self.classed('inactive')) {
					self.style('background', null)
				} else {
					self.style('background', function(d) {
						return _COLORS.weight[d];
					})
				}

				_drawGraph()
			})
			.on('mouseover', function(d) {
				d3.selectAll('.weight' + d)
					.style('opacity', 1.0)
					.attr('fill', '#d73027')
			})
			.on('mouseout', function(d) {
				d3.selectAll('.weight' + d)
					.style('opacity', 0.75)
					.attr('fill', function() { return _COLORS.weight[d]; })
			})

		// create loading indicator
		var loader = graphDIV.append('div')
			.attr('id', 'loader')
			.text('Loading...\nPlease wait')

		function _getData() {
// console.log('getting the data')
			loader.style('display', 'inline')
            d3.xhr(route + stationID)
                .response(function(request) {
                    return JSON.parse(request.responseText);
                })
                .post(JSON.stringify({'depth': depth}), function(error, data) {
                	if (error) {
                		console.log(error);
                		return;
                	}
                	time = TIMES[depth.length];

// console.log('formatting the data')
                	formattedData = _formatData(data);
// console.log('graphing the data\n')
                	_drawGraph();
                });
		}

		function _formatData(data) {
			var schema = [];
			for (var i in data.schema.fields) {
				schema.push(data.schema.fields[i].name)
			}
			var formatted = [];

			var obj = {};
			obj[time] = +data.rows[0].f[0].v;
			var cur = +data.rows[0].f[0].v;
			obj.data = [];
			var dataObj = {};

			for (var i = 1; i < schema.length; i++) {
				dataObj[schema[i]] = +data.rows[0].f[i].v;
			}
			dataObj.class = classScale(dataObj.class);
			dataObj.weight = weightScale(dataObj.weight*_CONVERT);
			obj.data.push(dataObj);
			formatted.push(obj);

			for (var i = 1; i < data.rows.length; i++) {
				if (+data.rows[i].f[0].v === cur) {
					dataObj = {};
					for (var j = 1; j < schema.length; j++) {
						dataObj[schema[j]] = +data.rows[i].f[j].v;
					}
					dataObj.class = classScale(dataObj.class);
					dataObj.weight = _convertWeight(dataObj.weight);
					obj.data.push(dataObj);
				} else {

					obj = {};
					obj[time] = +data.rows[i].f[0].v;
					cur = +data.rows[i].f[0].v;
					obj.data = [];
					dataObj = {};

					for (var j = 1; j < schema.length; j++) {
						dataObj[schema[j]] = +data.rows[i].f[j].v;
					}
					dataObj.class = classScale(dataObj.class);
					dataObj.weight = _convertWeight(dataObj.weight);
					obj.data.push(dataObj);
					formatted.push(obj);
				}
			}
/*
var total = 0;
formatted.forEach(function(d) {
	d.data.forEach(function(d) {
		total += d.amount;
	});
})
console.log(total);
*/
//console.log(formatted)
			return formatted;

			function _convertWeight(weight) {
				return (weight > 120000 ? 6 : weightScale(weight*_CONVERT))
			}
		}
		// attr must be the key to a sortable attribute of data.
		// sorts in increasing order by default.
		// if order is -1 then sorts in decreasing order
		function _sortBy(data, attr, order) {
			order = order || 1;
			return data.sort(function(a, b) {
				return order*(a[attr] - b[attr]);
			})
		}

		function _reduceData(attr) {
			var data = {
					Xmin: formattedData[0][time],
					Xmax: formattedData[0][time],
					Ymax: 0,
					ticks: []
				},
				reduced = [],
				obj,
				objData,
				keeper = (attr === 'class' ? 'weight' : 'class');

			for (var i in formattedData) {
				obj = {};
				obj[time] = formattedData[i][time];
				if (obj[time] > data.Xmax) {
					data.Xmax = obj[time];
				} else if (obj[time] < data.Xmin) {
					data.Xmin = obj[time];
				}
				data.ticks.push(obj[time]);

				objData = _reduce(formattedData[i].data, attr, keeper)
				obj.data = objData.data;
				data.Ymax = (objData.total > data.Ymax ? objData.total : data.Ymax);
				reduced.push(obj);
			}
			data.data = reduced;
/*
var total = 0;
reduced.forEach(function(d) {
	d.data.forEach(function(d) {
		total += d.amount;
	});
})
console.log(total);
*/
			return data;
		}

		function _reduce(data, attr, keeper) {
			var dataObj = {
					total: 0
				}
				reducedData = [],
				obj = null,
				cur = null;

			data = _sortBy(data, keeper);

			for (var i in data) {
				if (classFilter[data[i].class] || weightFilter[data[i].weight])
					continue;

				if (data[i][keeper] === cur) {
					obj.amount += data[i].amount;
					dataObj.total += data[i].amount;
				} else {
					obj = {};
						
					reducedData.push(obj);

					cur = data[i][keeper];

					obj.amount = data[i].amount;
					obj[keeper] = data[i][keeper];
					dataObj.total += obj.amount;
				}
			}
			dataObj.data = reducedData;

			return dataObj;
		}

		function _drawGraph() {
			var dataObj = _reduceData(reduceBy),
				data = dataObj.data,
				Xmin = dataObj.Xmin,
				Xmax = dataObj.Xmax,
				Ymax = dataObj.Ymax,
				ticks = dataObj.ticks;

		   	var barWidth = Math.min((wdth-(data.length+1)*2) / data.length, 75),
		   		space = wdth - (barWidth * data.length),
		   		gap = space / (data.length+1);

		   	var padding = (2*gap + barWidth) / (gap + barWidth);

		    Xscale.domain(ticks)
		    	.rangePoints([0, wdth], padding);

		   	Yscale.domain([0, Ymax]);

			var stacks = graphSVG.selectAll('.stack')
				.data(data);

			stacks.transition()
				.duration(500)
				.attr('transform', function(d, i) {
					return 'translate(' + (i*(barWidth + gap) + gap) + ', 0)';
				})
				.attr('class', 'stack')

			stacks.enter().append('g')
				.attr('transform', function(d, i) {
					return 'translate(' + (i*(barWidth + gap) + gap) + ', 0)';
				})
				.attr('class', 'stack')

			stacks.exit()
		    	.each(function() {
		    		d3.select(this).selectAll('rect')
		    			.transition()
		    			.duration(500)
						.attr('y', hght +'px')
						.attr('height', 0)
						.attr('opacity', 0.0)
				    	.remove()
		    	})
		    	.transition()
		    	.duration(500)
		    	.remove()

		    stacks.on('click', function(d) {
					if (!clicked && depth.length < 4) {
						clicked = true;
						depth.push(d[time]);
						_getData();
					}
					d3.event.stopPropagation();
				})
		    	.on('mouseover', function(d) {
		        	d3.select(this).selectAll('rect')
				        .style('opacity', 1.0)
				        //.attr('fill', function(d, i) { return _HOVER[i]; })
		        })
		        .on('mouseout', function(d) {
		        	d3.select(this).selectAll('rect')
				        .style('opacity', 0.75)
				        //.attr('fill', function(d, i) { return _COLORS[i]; })
		        })

			var bars = stacks.selectAll('rect')
				.data(function(d) { return _generateStacks(d.data); })

			bars.enter().append('rect')
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('stroke-width', 0)
				.style('opacity', 0.75)
		        .attr('fill', function(d) { return _COLORS[groupBy][d[groupBy]]; })
		        //.attr('class', function(d) { return groupBy+'-'+d[groupBy]; })

		    bars.transition()
		    	.duration(500)
		    	.attr('y', function(d) { return Yscale(d.amount)-d.float; })
		    	.attr('height', function(d) { return hght - Yscale(d.amount); })
		        .attr('width', barWidth)
		        .attr('fill', function(d) { return _COLORS[groupBy][d[groupBy]]; })
		        .attr('class', null)
		        .attr('class', function(d) { return groupBy+d[groupBy]; });

			bars.exit()
		    	.transition()
		    	.duration(500)
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('fill', '#f00')
		    	.remove();

		    Xaxis.tickValues(ticks);

		    var t = graphSVG.transition().duration(500);

		    t.select('.x-axis').call(Xaxis)
		    t.select('.y-axis').call(Yaxis);

		    _drawNavigator();

		    clicked = false;

			loader.style('display', 'none')

		    function _generateStacks(data) {
		    	var f = 0;
		    	data = _sortBy(data, 'amount', -1);

		    	for (var i in data) {
		    		data[i].float = f;
		    		f += hght - Yscale(data[i].amount);
		    	}

		    	return data;
		    }
		}

		function _drawNavigator() {
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
		var _MONTHS = {
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
					return _MONTHS[d];
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

	wimgraph.grapher = function(id) {
		return new _WIMGrapher(id);
	}

	this.wimgraph = wimgraph;
})()