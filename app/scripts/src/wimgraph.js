(function() {
	var wimgraph = {
		version: "0.1.0"
	};

	function _WIMGrapher(id) {
		var self = this,
		// data retrieved from backend and formatted
		// the data is kept as an array of objects. Each object
		// corresponds to a time and contains another array
		// of all data for that time. Each object has two keys:
		// the first is the time scale with a time value
		// such as... year: 12 for data from year 2012
		// the seconds key is data that contains an array
		// of all data for trucks from that time. The array is
		// in non-reduced format and contains objects with data for
		// truck weight, truck class, and the amount of trucks
			formattedData = [],
			stationID,			// current station being viewed
			clicked = false,	// used to keep track of when users click on graph

		// URL to retrieve graph data from
			route = 'http://localhost:1337/stations/graphData/',

		// depth is an array object that is treated as a stack.
		// as users delve deeper into graph times, the year, month, or
		// day being viewed is pushed onto depth. The stack is initialized
		// to the root of the data.
			depth = [0],
		// used to determine which time is currently being viewed,
		// the key corresponds to the length of depth
			TIMES = {
				1: 'year',
				2: 'month',
				3: 'day',
				4: 'hour'
			},
		// used to keep track of which time is currently being displayed,
		// year, month, day, or hour
			time = null,

		// this is used to track currently viewed class type
			groupBy = 'class',
		// this is used to keep track of which attribute to reduce
			reduceBy = (groupBy === 'class' ? 'weight' : 'class');

		// initialize graph div
		var graphDIV = d3.select(id).append('div')
			.attr('id', 'graphDIV'),
		// initialize measurements
			navBarWidth = 70,

			margin = {top: 10, right: 10, bottom: 25, left: 80},
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

	    // create weight and class toggle buttons
	    var togglesDiv = graphDIV.append('div')
	    	.attr('class', 'navBar')
			.style('right', margin.right +'px')
			.style('bottom', margin.top+'px')
			.style('width', navBarWidth+'px');

		togglesDiv.append('a')
			.text('Class')
			.classed('inactive', function() {
				return reduceBy === 'class';
			})
			.classed('active', function() {
				return groupBy === 'class';
			})
			.on('click', _toggle)

		togglesDiv.append('a')
			.text('Weight')
			.classed('inactive', function() {
				return reduceBy === 'weight';
			})
			.classed('active', function() {
				return groupBy === 'weight';
			})
			.on('click', _toggle)
		// function to control toggles
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

		// this scales maps classes to array index
		var classScale = d3.scale.ordinal()
			.domain([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
			.range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),

		// this scale maps weights to weight scales
		// weight class 0 corressponds to weights [0, 20,000),
		// weight class 1 corresponds to weights [20,000, 40,000)
		// ...
		// weight class 6 corresponds to weights 120,000 and above
			weightScale = d3.scale.quantize()
			.domain([0, 140000])
			.range([0, 1, 2, 3, 4, 5, 6]),

			_CONVERT = 220.462;

		// used to color class and weight legends
		var _COLORS = {
			class: ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1","#ddffff","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],
			weight: ["#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603"]
		}
		var _FILTERS = {
		// data filters for various classes. False indicates filter is inactive.
		// indexes [0, 12] correspond to classes [2, 14]
			class: [false,false,false,false,false,false,false,false,false,false,false,false,false],
		// data filters for the weight classes
		// indexes [0, 6] directly correspond to weight classes [0, 6]
			weight: [false,false,false,false,false,false,false]
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
			.attr('id', 'legendDIV');
		// class legend
		var classLegend = legendDIV.append('div')
			.attr('class', 'legend');
		// weight legend
		var weightLegend = legendDIV.append('div')
			.attr('class', 'legend')
			.style('text-align', 'left')
			.style('top', '45px');

		function _createLegendLabels(legend, values, attr) {
			values.sort(function(a, b) { return a-b; });

			var labels = legend.selectAll('a').data(values);

			labels.exit().remove();

			labels.enter().append('a')
				.attr('class', attr+'-label')
				.on('click', function(d) {
					clicked = true;
					var self = d3.select(this)

					self.classed('inactive', !self.classed('inactive'));
					_FILTERS[attr][d] = self.classed('inactive');

					if (self.classed('inactive')) {
						self.style('background', null)
					} else {
						self.style('background', function(d) {
							return _COLORS[attr][d];
						})
					}

					_drawGraph()
				})
				.on('mouseover', function(d) {
					d3.selectAll('.'+attr + d)
						.style('opacity', 1.0)
						.attr('fill', '#d73027')
				})
				.on('mouseout', function(d) {
					d3.selectAll('.'+attr + d)
						.style('opacity', 0.75)
						.attr('fill', function() { return _COLORS[attr][d]; })
				});

			labels.classed('inactive', function(d) {
					return _FILTERS[attr][d]
				})
				.style('background', function(d) {
					if (d3.select(this).classed('inactive')) {
						return null;
					}
					return _COLORS[attr][d];
				})
				.text(function(d, i) {
					var text;
					if (attr === 'weight') {
						text = '0 lbs.';
						if (d > 0) {
							text = (d*20).toString() + 'k lbs.';
						}
					} else {
						text = 'Cls '+classScale.domain()[d];
					}
					return text;
				})

			legend.style('width', function() {
					var w = parseInt(d3.select('.'+attr+'-label').style('width'));
					return (w * values.length + 10) + 'px';
				})
				.style('background-color', '#000');
		}


		// create loading indicator
		var loader = graphDIV.append('div')
			.attr('id', 'loader')
			.text('Loading...\nPlease wait')

		// this function retrieves the requested data from the back end API
		function _getData() {
			loader.style('display', 'inline')
			/*
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

                	formattedData = _formatData(data);

                	_drawGraph();
                });
            */
            wimXHR.post(route+stationID, {'depth': depth}, function(error, data) {
            	if (error) {
            		console.log(error);
            		return;
            	}
            	time = TIMES[depth.length];

            	formattedData = _formatData(data);

            	_drawGraph();
            });
		}
		var classValues = [];
		var weightValues = [];

		// this function formats the data returned from Google big query
		// into a more usable form. The result is returned and is stored
		// in the formattedData private variable
		function _formatData(data) {
			classValues = [];
			weightValues = [];

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
			_pushUnique(classValues, dataObj.class);
			dataObj.weight = weightScale(dataObj.weight*_CONVERT);
			_pushUnique(weightValues, dataObj.weight);

			obj.data.push(dataObj);
			formatted.push(obj);

			for (var i = 1; i < data.rows.length; i++) {
				if (+data.rows[i].f[0].v === cur) {
					dataObj = {};
					for (var j = 1; j < schema.length; j++) {
						dataObj[schema[j]] = +data.rows[i].f[j].v;
					}
					dataObj.class = classScale(dataObj.class);
					_pushUnique(classValues, dataObj.class);
					dataObj.weight = weightScale(dataObj.weight*_CONVERT);
					_pushUnique(weightValues, dataObj.weight);

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
					_pushUnique(classValues, dataObj.class);
					dataObj.weight = weightScale(dataObj.weight*_CONVERT);
					_pushUnique(weightValues, dataObj.weight);

					obj.data.push(dataObj);
					formatted.push(obj);
				}
			}

			_createLegendLabels(classLegend, classValues, 'class')
			_createLegendLabels(weightLegend, weightValues, 'weight')

			return formatted;

			function _pushUnique(list, value) {
				if (list.indexOf(value) === -1) {
					list.push(value);
				}
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
		// reduces formatted data, eliminating attr and grouping by keeper.
		// this function also keeps track of min and max time values, max
		// number of trucks, and all of the times with data. This data is
		// required to set the domains of the x and y scales.
		function _reduceData(attr, keeper) {
			var data = {
					Xmin: formattedData[0][time],
					Xmax: formattedData[0][time],
					Ymax: 0,
					ticks: []
				},
				reduced = [],
				obj,
				objData;

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

			return data;
		}
		// reduces the data on trucks, eliminating attr and summing
		// truck amounts into keeper
		function _reduce(data, attr, keeper) {
			var dataObj = {
					total: 0
				}
				reducedData = [],
				obj = null,
				cur = null;

			data = _sortBy(data, keeper);

			for (var i in data) {
				// apply any filters to the data
				if (_FILTERS.class[data[i].class] || _FILTERS.weight[data[i].weight])
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
		// this function draws the graph. it begins by reducing
		/// the data by current toggle and applying any filters.
		function _drawGraph() {
			var dataObj = _reduceData(reduceBy, groupBy),
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
		        })
		        .on('mouseout', function(d) {
		        	d3.select(this).selectAll('rect')
				        .style('opacity', 0.75)
		        })

			var bars = stacks.selectAll('rect')
				.data(function(d) { return _generateStacks(d.data); })

			bars.enter().append('rect')
				.attr('y', hght +'px')
				.attr('height', 0)
				.attr('stroke-width', 0)
				.style('opacity', 0.75)
		        .attr('fill', function(d) { return _COLORS[groupBy][d[groupBy]]; })

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
				.on('click', _clicked);
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
		function _clicked(d, i) {
			if (!clicked && i+1 < depth.length) {
				clicked = true;
				while (depth.length-1 > i) {
					depth.pop();
				}
				_getData();
			}
		}
		function _getNavBarText(d, i) {
			switch(i) {
				case 0:
					return 'Root'
				case 1:
					return _getYear(d);
				case 2:
					return _MONTHS[d];
				case 3:
					return _getSuffix(d);
			}
		}
		function _getYear(d) {
			if (/^\d$/.test(d.toString())) {
				return '200' + d;
			} else {
				return '20' + d;
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