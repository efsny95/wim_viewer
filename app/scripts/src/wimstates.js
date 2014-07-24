(function() {
	var wimstates = {
		version: 0.1,
	}

	var mapDIV = null,
		SVG = null,
		popup = null,
		geoJSON = null,
		centered = null,
		$scope = null,
		clicked = false;

	var width = null,
		height = 600;

	var projection = d3.geo.albersUsa()
		.scale(1 << 10);

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
			.on('click', function(d) {
				if (!clicked) {
					clicked = true;
					_clickZoom(d);
				}
			})
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

			var collection = {
				type: 'FeatureCollection',
				features: []
			};
			var	URL;

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
				URL = '/stations/stateGeo/';
				_getStationPoints();

				_getStationData(d);
			} else {
				d3.selectAll('.station').remove();

				collection.features = [];
			  		
		  		$scope.$apply(function() {
		  			$scope.stations = [];
		  			//$scope.stationsClass = [];
		  			$scope.stationsWeight = [];
		  			$scope.overWeightTrucks = [];
		  		});
				clicked = false;
			}

			SVG.selectAll("path")
			    .classed("state-active", centered && function(d) { return d === centered; });

			SVG.transition()
			    .duration(750)

			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"+
			    				    "scale(" + k + ")"+
			    				    "translate(" + -x + "," + -y + ")");

			function _getStationPoints() {
				wimXHR.get(URL + d.id, function(error, data) {
	            	if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	_drawStationPoints(_formatData(d, data));
					clicked = false;
				})
			}


			function _formatData(stateData, stationData) {
				var stations = {};
				stationData.features.forEach(function(d) {
					if (d.geometry.coordinates[0] != 0 && d.geometry.coordinates[1] != 0) {
						stations[d.properties.station_id] = d.geometry;
					}
				});

				//stateData.properties.stations.forEach(function(d) {
				for (var i in stateData.properties.stations) {
					var d = stateData.properties.stations[i];

					var obj = {
						type: 'Feature',
						properties: {},
						geometry: {}
					};
					obj.properties.stationID = d.stationID;
					obj.properties.count = d.stationCount;
					obj.properties.type = d.stationType;

					if (d.stationID in stations) {
						obj.geometry = stations[d.stationID];
						collection.features.push(obj);
					}
				}
				return collection;
			}
		} // end _clickZoom

		function _drawStationPoints(collection) {
			var stations = SVG.selectAll('circle')
				.data(collection.features);

			stations.exit().remove();

			stations.enter().append('circle');

			stations.attr('class', 'station')
				.attr('r', 1.5)
				.attr('opacity', 0.66)
				.attr('fill', function(d) {
					if (d.properties.type == 'wim') {
						return '#081d58';
					} else {
						return '#ff0000';
					}
				})
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
					var URL = '#/station/' + 
						d.properties.type + '/' +
						d.properties.stationID;

					open(URL, '_self');
				})
		}
		// this function queries backend for all stations
		// and then updates $scope.stations variable in
		// order to draw list of stations below map
		function _getStationData(stateData) {
			var URL = 'stations/byState/';
			var id = stateData.id.toString();

			var regex = /^\d$/;

			if (id.match(regex)) {
				id = '0' + id;
			}

			//On first runs, initialize the graphs

			if($scope.curYearWeight === "FR"){
				AADTGraph.initAADTGraph("#barGraph");
			    truckWeightGraph.initTruckWeightGraph("#barGraph");
			    lineChart.initlineChart("#barGraph");
			    monthlyLineChart.initMonthlylLineChart("#barGraph");
			}

			//Stations class must be outside the load graphs scope due to the data being worked with

			var stationsClass = [];
			var stationsTable = [];

			

			/*

			The below function is called by pressing the apply button. It draws graphs and the bar table based on various conditions

			*/


			$scope.loadGraphs = function(){
				
				var yearArr = []; //Used in the bar graph for year data
				
				//When trying to display year data for the first time or when switching from weight data. 
				//In the future it would be better to switch the condition to run this to be only when
				//the state is changed
				if(($scope.curYearWeight === "FR" && $scope.myBarType === "Year") || ($scope.curYearWeight === "Weight" && $scope.myBarType === "Year")){

					//Empty array of previous year data. This method is supposedly faster than stations.length = 0
					while(stationsClass.length > 0){
						stationsClass.pop()
					}

					URL = 'stations/byState/class/'
					

					wimXHR.get(URL + id, function(error, data) {
						if (error) {
		            		console.log(error);
		            		return;
		            	}
		            	if(data.rows != undefined){
					  		data.rows.forEach(function(row){
						  			var rowStation = row.f[0].v;
						  			if(getStationIndex(rowStation,"class") == -1) {
						  				stationsClass.push({'stationId':rowStation, years:[],heights:[],'AAPT':0,'AASU':0,'AATT':0})
						  				//For the heights of the various sub columns
						  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
						  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
						  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
						  			}
						  			if(parseInt(row.f[1].v) < 10){
						  				row.f[1].v = "0"+row.f[1].v
						  			}
						  			stationsClass[getStationIndex(rowStation,"class")].years.push({'year':row.f[1].v,'ADT':Math.round(row.f[2].v),'APT':Math.round(row.f[3].v),'ASU':Math.round(row.f[4].v),'ATT':Math.round(row.f[5].v)});
						  			
					  		});
				  		}
				  		 $scope.stationsClass = JSON.parse(JSON.stringify(stationsClass));
				  		 		barTable.removeTable();
					  			if($scope.myBarType === "Year"){
							          while(yearArr.length > 0){
							            yearArr.pop()
							          }
							          if($scope.myYearA != "--"){
							            if($scope.myYearB != "--"){
							              yearArr = [$scope.myYearA,$scope.myYearB]
							            }
							            else{
							              yearArr = [$scope.myYearA]
							            }
							          }
							          AADTGraph.drawAADTGraph($scope.stationsClass,"class",$scope.myVehicleTypeArr,yearArr);
							          $scope.curYearWeight = "Year" 
							        }

				});
				URL = '/stations/byState/classTable/'
				wimXHR.get(URL + id, function(error, data) {
						if (error) {
		            		console.log(error);
		            		return;
		            	}
		            	if(data.rows != undefined){
					  		data.rows.forEach(function(row){
						  			var rowStation = row.f[0].v;
						  			if(getStationIndex(row.f[4].v,"state") == -1){
						  				stationsTable.push({'state':row.f[4].v,stations:[]})
						  			}
						  			if(getStationIndex(row.f[4].v,"class2",rowStation) == -1) {
						  				stationsTable[getStationIndex(row.f[4].v,"state")].stations.push({'stationId':rowStation, years:[]})
						  			}
						  			if(getStationIndex(row.f[4].v,"year",rowStation,row.f[1].v) == -1){
						  				stationsTable[getStationIndex(row.f[4].v,"state")].stations[getStationIndex(row.f[4].v,"class2",rowStation)].years.push({'year':row.f[1].v,months:[0,0,0,0,0,0,0,0,0,0,0,0]})
						  			}
						  			stationsTable[getStationIndex(row.f[4].v,"state")].stations[getStationIndex(row.f[4].v,"class2",rowStation)].years[getStationIndex(row.f[4].v,"year",rowStation,row.f[1].v)].months[parseInt(row.f[2].v)-1] = parseInt(row.f[3].v)
						  	});
				  		}
				  		//barTable.drawTable(stationsTable);
				});
				
			}
			//If looking at the same data again
			else if(($scope.curYearWeight === $scope.myBarType) && $scope.curYearWeight === "Year") {
					console.log("c")
					barTable.removeTable();
					$scope.stationsClass = JSON.parse(JSON.stringify(stationsClass));
					if($scope.myBarType === "Year"){
						          while(yearArr.length > 0){
						            yearArr.pop()
						          }
						          if($scope.myYearA != "--"){
						            if($scope.myYearB != "--"){
						              yearArr = [$scope.myYearA,$scope.myYearB]
						            }
						            else{
						              yearArr = [$scope.myYearA]
						            }
						          }
						          if($scope.stationsClass.length != 0){
						            //barTable.drawTable($scope.stationsClass);
						          }
						          AADTGraph.drawAADTGraph($scope.stationsClass,"class",$scope.myVehicleTypeArr,yearArr); 
						        }
			}
						
			/*The following block of code is used for creating a bar graph that looks at total weight over total time
			at the station. Works in the same manner as the above block of code*/

			if(($scope.curYearWeight === "FR" && $scope.myBarType === "Weight") || ($scope.curYearWeight === "Year" && $scope.myBarType === "Weight")){
				
				URL = 'stations/byState/weight/'
				var stationsWeight = [];
			    wimXHR.post(URL + id, {class:$scope.myTruckClass},function(error, data) {
					if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	if(data.rows != undefined){

	            		data.rows.forEach(function(row){
							var rowStation = row.f[0].v;
							if(getStationIndex(rowStation,"weight") == -1) {
								stationsWeight.push({'stationId':rowStation, years:[]})
								
							}
							if(parseInt(row.f[1].v) < 10){
								row.f[1].v = "0"+row.f[1].v
							}
							stationsWeight[getStationIndex(rowStation,"weight")].years.push({'year':row.f[1].v,'hours':row.f[2].v,'Weight':row.f[3].v});
						
						});
				  		
				  		
						  		$scope.stationsWeight = JSON.parse(JSON.stringify(stationsWeight));
						  		console.log("b")
						  		barTable.removeTable();
						  		AADTGraph.drawAADTGraphWeight($scope.stationsWeight,"weight",$scope.myTruckClass);
              					$scope.curYearWeight = "Weight"

				  	}

				});
			}
			else if(($scope.curYearWeight === $scope.myBarType) && $scope.curYearWeight === "Weight"){
				$scope.stationsWeight = JSON.parse(JSON.stringify(stationsWeight));
				console.log("a")
				barTable.removeTable();
				AADTGraph.drawAADTGraphWeight($scope.stationsWeight,"weight",$scope.myTruckClass);
              					
			}

			//Below are the overweight truck data.

			//REMEMEBER TO EDIT THE THRESHOLD AS SOME POINT SO IT ISN'T ALWAYS A CONSTANT!!!!!

			//Runs in the same manner as the above two blocks of code

			if($scope.curLine === "FR" || ($scope.curLine !== $scope.myLine)){
				
				URL = 'stations/byState/overweight/'
				var overWeight = [];
				var count = 0
				if($scope.myLine === "on"){
					var lineGraph = "month"
				}
				else{
					var lineGraph = $scope.myTimePeriod
				}
				wimXHR.post(URL + id,{timeType:lineGraph,threshold:80000,queryType:$scope.myLine} ,function(error, data) {
			    	if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	if(data.rows != undefined){
	            		data.rows.forEach(function(row){
							var rowStation = row.f[0].v;
							if(getStationIndex(rowStation,"overweight") == -1) {
								if($scope.myLine ==="on"){
									overWeight.push({'stationId':rowStation, 'funcCode': row.f[4].v,perOverWeight:[0,0,0,0,0,0,0,0,0,0,0,0],avgOverWeight:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]})
								}
								else{
									overWeight.push({'stationId':rowStation, years:[]})							
								}
							}
							if(parseInt(row.f[3].v) < 10){
								row.f[3].v = "0"+row.f[3].v
							}

							if($scope.myLine === "off"){
								overWeight[getStationIndex(rowStation,"overweight")].years.push({'overweightTrucks':row.f[1].v,'numTrucks':row.f[2].v,'year':row.f[3].v})
							}
							else{
								overWeight[getStationIndex(rowStation,"overweight")].avgOverWeight[parseInt(row.f[3].v)-1] = overWeight[getStationIndex(rowStation,"overweight")].avgOverWeight[parseInt(row.f[3].v)-1] + parseInt(row.f[1].v)
								overWeight[getStationIndex(rowStation,"overweight")].perOverWeight[parseInt(row.f[3].v)-1] = overWeight[getStationIndex(rowStation,"overweight")].perOverWeight[parseInt(row.f[3].v)-1] + parseInt(row.f[2].v)
								overWeight[getStationIndex(rowStation,"overweight")].avgOverWeight[parseInt(row.f[3].v)+11] = overWeight[getStationIndex(rowStation,"overweight")].avgOverWeight[parseInt(row.f[3].v)+11] + 1
							}
							});
				  		
				  		// if (centered) {
					  		
						  // 	$scope.$apply(function(){
						  		if($scope.myLine === "on"){
							  		for(var i = 0;i<overWeight.length;i++){
							  			for(var j = 0;j<12;j++){
							  				if(overWeight[i].avgOverWeight[12] != 0){
							  					overWeight[i].avgOverWeight[j] = overWeight[i].avgOverWeight[j] / overWeight[i].avgOverWeight[12]
							  					overWeight[i].perOverWeight[j] = overWeight[i].perOverWeight[j] / overWeight[i].avgOverWeight[12]
							  					overWeight[i].perOverWeight[j] = overWeight[i].avgOverWeight[j] / overWeight[i].perOverWeight[j]
							  					overWeight[i].perOverWeight[j] = overWeight[i].perOverWeight[j] * 100
							  				}
							  				overWeight[i].avgOverWeight.splice(12,1)
							  			}
							  		}
							  	}
						  		$scope.overWeightTrucks = overWeight;
						  		if($scope.myLine === "on"){
						            lineChart.drawlineChart($scope.overWeightTrucks,$scope.myOrder);
						            $scope.curLine = $scope.myLine
						          }
						          else{
						            truckWeightGraph.drawTruckWeightGraph($scope.overWeightTrucks,$scope.myOrder,$scope.myTimePeriod);
						            $scope.curLine = $scope.myLine

						          }
						//   	});
						// }	
				  	}

				});
			}
			else if($scope.myLine === $scope.curLine){
				if($scope.myLine === "on"){
            		lineChart.drawlineChart($scope.overWeightTrucks,$scope.myOrder);
          		}
		        else{
		            truckWeightGraph.drawTruckWeightGraph($scope.overWeightTrucks,$scope.myOrder,$scope.myTimePeriod);
		            
		        }
			}

			//Monthly AADT

			if($scope.curState === "Blank" && $scope.myTimePeriod2 === "month"){

			URL = 'stations/byState/byMonthLine/'
				var stationsMonth = [];
			    wimXHR.get(URL + id, function(error, data) {
					if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	if(data.rows != undefined){

	            		data.rows.forEach(function(row){
							var rowStation = row.f[0].v;
							if(getStationIndex(rowStation,"month") == -1) {
								stationsMonth.push({'stationId':rowStation, 'funcCode':row.f[6].v,monthsAll:[0,0,0,0,0,0,0,0,0,0,0,0], monthsAPT:[0,0,0,0,0,0,0,0,0,0,0,0], monthsASU:[0,0,0,0,0,0,0,0,0,0,0,0], monthsATT:[0,0,0,0,0,0,0,0,0,0,0,0]})
								
							}
							stationsMonth[getStationIndex(rowStation,"month")].monthsAll[parseInt(row.f[1].v)-1] = parseInt(row.f[2].v)
							stationsMonth[getStationIndex(rowStation,"month")].monthsAPT[parseInt(row.f[1].v)-1] = parseInt(row.f[3].v)
							stationsMonth[getStationIndex(rowStation,"month")].monthsASU[parseInt(row.f[1].v)-1] = parseInt(row.f[4].v)
							stationsMonth[getStationIndex(rowStation,"month")].monthsATT[parseInt(row.f[1].v)-1] = parseInt(row.f[5].v)
							

						
						});
				  		
				  		
						  		$scope.stationsMonthlyTraffic = JSON.parse(JSON.stringify(stationsMonth));
						  		monthlyLineChart.drawMonthlyLineChart($scope.stationsMonthlyTraffic,$scope.myMonthlyTraffic);
              					
				  	}

				});
			}
			else if($scope.myTimePeriod2 === "month"){
				monthlyLineChart.drawMonthlyLineChart($scope.stationsMonthlyTraffic,$scope.myMonthlyTraffic);
			}

			if($scope.curState === "Blank" && $scope.myTimePeriod2 === "hour"){
			URL = 'stations/byState/byHourLine/'
				var stationsHour = [];
			    wimXHR.get(URL + id,function(error, data) {
					if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	if(data.rows != undefined){

	            		data.rows.forEach(function(row){
							var rowStation = row.f[0].v;
							if(getStationIndex(rowStation,"hour") == -1) {
								stationsHour.push({'stationId':rowStation, 'funcCode':row.f[6].v,hoursAll:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hoursAPT:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hoursASU:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hoursATT:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]})
								
							}
							stationsHour[getStationIndex(rowStation,"hour")].hoursAll[parseInt(row.f[1].v)] = parseInt(row.f[2].v)
							stationsHour[getStationIndex(rowStation,"hour")].hoursAPT[parseInt(row.f[1].v)] = parseInt(row.f[3].v)
							stationsHour[getStationIndex(rowStation,"hour")].hoursASU[parseInt(row.f[1].v)] = parseInt(row.f[4].v)
							stationsHour[getStationIndex(rowStation,"hour")].hoursATT[parseInt(row.f[1].v)] = parseInt(row.f[5].v)
							

						
						});
				  		
				  				$scope.stationsHourlyTraffic = JSON.parse(JSON.stringify(stationsHour));
						  		monthlyLineChart.drawHourlyLineChart($scope.stationsHourlyTraffic,$scope.myMonthlyTraffic);
              					
				  	}

				});
			}
			else if($scope.myTimePeriod2 === "hour"){
				monthlyLineChart.drawHourlyLineChart($scope.stationsHourlyTraffic,$scope.myMonthlyTraffic);
			}
			
		  	function getStationIndex(stationID,classT,station,YOD){
		  		if(classT === "weight"){
		  			return stationsWeight.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  		else if(classT === "overweight"){
		  			return overWeight.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  		else if(classT === "state"){
		  			return stationsTable.map(function(el){return el.state;}).indexOf(stationID)
		  		}
		  		else if(classT === "class2"){
		  			return stationsTable[getStationIndex(stationID,"state")].stations.map(function(el){return el.stationId;}).indexOf(station)
		  		}
		  		else if(classT === "year"){
		  			return stationsTable[getStationIndex(stationID,"state")].stations[getStationIndex(stationID,"class2",station)].years.map(function(el) {return el.year}).indexOf(YOD)
		  		}
		  		else if(classT === "month"){
		  			return stationsMonth.map(function(el){return el.stationId;}).indexOf(stationID)
		  		}
		  		else if(classT === "hour"){
		  			return stationsHour.map(function(el){return el.stationId;}).indexOf(stationID)
		  		}
		  		else if(classT != "class"){
		  			return stations.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  		else{
		  			return stationsClass.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  	}
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
	// states is an array of state objects
	wimstates.drawMap = function(id, states, $s) {
		mapDIV = d3.select(id)

		width = parseInt(mapDIV.style('width'));
		projection.translate([width/2, height/2]);

		SVG = mapDIV.append('svg')
			.attr('id', 'mapSVG')
			.attr('height', height)
			.attr('width', width)
			.append('g');

		popup = mapDIV.append('div')
			.attr('class', 'station-popup')

		$scope = $s;

		// states object
		var obj = {};

		var domain = [];

		// load scope states data into states object
		for (var i in states) {
			obj[states[i].state_fips] = {stations: states[i].stations, name: states[i].name}
			domain.push(states[i].stations.length);
		}
		colorScale.domain(d3.extent(domain));

		d3.json('./us-states-10m.json', function(error, states) {

			geoJSON = topojson.feature(states, states.objects.states);

			var props;
			geoJSON.features.forEach(function(d) {
				// pad single digit FIPS with a 0 for compatibility
				if (d.id.toString().match(/^\d$/)) {
					d.id = '0' + d.id;
				}
				d.properties.fips = d.id.toString();
				if (d.id in obj) {
					d.properties.stations = obj[d.id].stations;
					d.properties.name = obj[d.id].name;
				}
			})

			_drawMap();
		})
	}

	this.wimstates = wimstates;
})()