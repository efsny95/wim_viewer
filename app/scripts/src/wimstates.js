(function() {
	var wimstates = {
		version: 0.1,
	}

	var mapDIV = null,
		SVG = null,
		popup = null,
		geoJSON = null,
		centered = null,
		$scope = null;

	var width = 1000,
		height = 600;

	var projection = d3.geo.albersUsa()
		.scale(1 << 10)
		.translate([width/2, height/2]);

	var path = d3.geo.path()
		.projection(projection);

	var colorScale = d3.scale.linear()
		.range(['#deebf7', '#08306b']);

	function _drawMap() {
		var states = SVG.selectAll('path')
			.data(geoJSON.features)

		states.enter().append('path')
			.attr('fill', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					return colorScale(d.properties.stations.length);
				} else {
					return '#999';
				}
			})
			.attr('class', 'state')
			.attr('d', path)
			.on('click', _clickZoom)
			.on('mouseover', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					d3.select(this).classed('state-hover', true);
				}
			})
			.on('mouseout', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					d3.select(this).classed('state-hover', false);
				}
			});

		function _clickZoom(d) {
			if (typeof d.properties.stations === 'undefined') {
				return;
			}
			var x, y, k;

			if (d && centered !== d) {
			    var bounds = path.bounds(d);
			    var wdth = bounds[1][0] - bounds[0][0];
			    var hght = bounds[1][1] - bounds[0][1];
			    x = bounds[1][0] - wdth/2
			    y = bounds[1][1] - hght/2
			    k = Math.floor(Math.min(width/wdth, height/hght));
			    centered = d;
			} else {
			    x = width / 2;
			    y = height / 2;
			    k = 1;
			    centered = null;
			}

			if (centered) {
				_getStationPoints(d);
				_getStationData(d);
			} else {
				d3.selectAll('.station').remove();
			  		
		  		$scope.$apply(function() {
		  			$scope.stations = [];
		  		});
			}

			SVG.selectAll("path")
			    .classed("state-active", centered && function(d) { return d === centered; });

			SVG.transition()
			    .duration(750)
			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
		}

		function _getStationPoints(d) {
			var URL = '/stations/stateGeo/';

			wimXHR.get(URL + d.id, function(error, data) {
            	if (error) {
            		console.log(error);
            		return;
            	}
            	_formatData(d, data);
			})
		}

		function _formatData(stateData, stationData) {
			var stations = {};
			stationData.features.forEach(function(d) {
				if (d.geometry.coordinates[0] != 0 && d.geometry.coordinates[1] != 0) {
					stations[d.properties.station_id] = d.geometry;
				}
			});

			var collection = {
				type: 'FeatureCollection',
				features: []
			};
			var noGeoFor = [];
			stateData.properties.stations.forEach(function(d) {
				var obj = {
					type: 'Feature',
					properties: {},
					geometry: {}
				};
				obj.properties.stationID = d.stationID;
				obj.properties.count = d.stationCount;
				if (d.stationID in stations) {
					obj.geometry = stations[d.stationID];
					collection.features.push(obj);
				} else {
					obj = {};
					obj[d.stationID] = d.stationCount;
					noGeoFor.push(obj);
				}
			})

			_drawStationPoints(collection);
		}

		function _drawStationPoints(collection) {
			var stations = SVG.selectAll('circle')
				.data(collection.features);

			stations.exit().remove();

			stations.enter().append('circle');

			stations.attr('class', 'station')
				.attr('r', 1.5)
				.attr('opacity', 0.66)
				.attr('fill', '#081d58')
				.attr('cx', function(d) {
					return projection(d.geometry.coordinates)[0];
				})
				.attr('cy', function(d) {
					return projection(d.geometry.coordinates)[1];
				})
				.on('mouseover', function(d) {
					d3.select(this)
						.attr('opacity', 1.0);
					_popup(d);
				})
				.on('mouseout', function(d) {
					d3.selectAll('.station')
						.attr('opacity', 0.66);
					popup.style('display', 'none')
				})
				.on('mousemove', _popup)
				.on('click', function(d) {
					var URL = '#/station/';
					open(URL + d.properties.stationID, '_self');
				})
		}

		function _getStationData(stateData) {
			var URL = '/stations/byState/';
			var id = stateData.id.toString();

			var regex = /^\d$/;

			if (id.match(regex)) {
				id = '0' + id;
			}

		  	var stations = [];

			wimXHR.get(URL + id, function(error, data) {
            	if (error) {
            		console.log(error);
            		return;
            	}
		  		data.rows.forEach(function(row){
		  			var rowStation = row.f[0].v;
		  			
		  			if(getStationIndex(rowStation) == -1) {
		  				stations.push({'stationId':rowStation, years:[]})
		  			}
		  			stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
		  		});
		  		if (centered) {
			  		$scope.$apply(function(){
			  			$scope.stations = stations;
		  			});
			  	}
			});

		  	function getStationIndex(stationID){
		  		return stations.map(function(el) {return el.stationId;}).indexOf(stationID);
		  	}
		}
	}

	function _popup(d) {
		var wdth = parseInt(popup.style('width')),
			hght = parseInt(popup.style('height'));

		var xPos = d3.event.offsetX - wdth/2,
			yPos = (d3.event.offsetY-hght-15);

		if (yPos < 0) {
			yPos = d3.event.offsetY + 20;
		}

		popup.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.style('display', 'block')
			.html('<b>Station ID:</b> ' + d.properties.stationID)
	}

	wimstates.drawMap = function(id, states, $s) {
		mapDIV = d3.select(id)

		SVG = mapDIV.append('svg')
			.attr('id', 'mapSVG')
			.attr('height', height)
			.attr('width', width)
			.append('g');

		popup = mapDIV.append('div')
			.attr('class', 'popup')

		$scope = $s;

		var obj = {};

		var domain = [];

		states.forEach(function(d) {
			obj[d.state_fips] = {stations: d.stations, name: d.name}
			domain.push(d.stations.length);
		})
		colorScale.domain(d3.extent(domain));

		d3.json('./us-states-10m.json', function(error, states) {

			geoJSON = topojson.feature(states, states.objects.states);

			var props;
			geoJSON.features.forEach(function(d) {

				if (d.id.toString().match(/^\d$/)) {
					d.id = '0' + d.id;
				}
				if (d.id in obj) {
					d.properties.fips = d.id.toString();
					d.properties.name = obj[d.id].name;
					d.properties.stations = obj[d.id].stations;
				}
			})

			_drawMap();
		})
	}

	this.wimstates = wimstates;
})()