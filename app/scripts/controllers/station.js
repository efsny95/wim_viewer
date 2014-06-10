'use strict';


angular.module('wimViewerApp')
  .controller('StationCtrl', function ($scope,$http,$routeParams) {
    $scope.station = $routeParams['stationId']
    $scope.values = [
      { id: 0, label: 'All' },
      { id: 4, label: '4' },
      { id: 5, label: '5' },
      { id: 6, label: '6' },
      { id: 7, label: '7' },
      { id: 8, label: '8' },
      { id: 9, label: '9' },
      { id: 10, label: '10' },
      { id: 11, label: '11' },
      { id: 12, label: '12' },
      { id: 13, label: '13' },
    ];
    var m = [19, 20, 20, 19], // top right bottom left margin
      w = 800 - m[1] - m[3], // width
      h = 136 - m[0] - m[2], // height
      z = 14 // cell size

      var day = d3.time.format("%w"),
          week = d3.time.format("%U"),
          percent = d3.format(".1%"),
          format = d3.time.format("%Y-%m-%d");

      $scope.minYear = ""
      $scope.maxYear = ""

      var URL = '/stations/byStation';

      wimXHR.get(URL, function(error, data) {
          $scope.minYear = data.rows[0].f[0].v
          $scope.maxYear = data.rows[0].f[1].v

          if(parseInt($scope.minYear) < 10){
            $scope.minYear = "0"+$scope.minYear
          }
          if(parseInt($scope.maxYear) < 10){
            $scope.maxYear = "0"+$scope.maxYear
          }

          var svg = d3.select("#caldiv").selectAll("svg")
              .data(d3.range(2000+parseInt($scope.minYear), 2001+parseInt($scope.maxYear)))
            .enter().append("svg")
              .attr("width", w + m[1] + m[3]+100)
              .attr("height", h + m[0] + m[2])
              .attr("class", "RdYlGn")
            .append("g")
              .attr("transform", "translate(" + (m[3] + (w - z * 53) / 2) + "," + (m[0] + (h - z * 7) / 2) + ")");
          svg.append("text")
              .attr("transform", "translate(-6," + z * 3.5 + ")rotate(-90)")
              .attr("text-anchor", "middle")
              .text(String);
          var svg2 = d3.select("#legend").selectAll("svg")
              .data(d3.range(0, 1))
            .enter().append("svg")
              .attr("width", w + m[1] + m[3]+100)
              .attr("height", h +300)
              .attr("class", "RdYlGn")
            .append("g")
              .attr("transform", "translate(" + (m[3] + (w - z * 53) / 2) + "," + (m[0] + (h - z * 7) / 2) + ")");
          var rect = svg.selectAll("rect.day")
              .data(function(d) { 
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("rect")
              .attr("class", "day")
              .attr("width", z)
              .attr("height", z)
              .attr("x", function(d) { return week(d) * z; })
              .attr("y", function(d) { return day(d) * z; })
              //.map(format);

          rect.append("title")
              .text(function(d) { return d; });

          $scope.stationData = [];
          $scope.myClass = $scope.values[0].id;
          
          wimXHR.get('/stations/byStation/'+$scope.station, function(error, data) {
              $scope.stationData = data;
              calCreate(rect,svg,$scope.myClass,data,day,week,percent,format,z,svg2)
          });
          
          // create graph object and draw a graph
          $scope.grapher = wimgraph.grapher('#wimgraph');
          $scope.grapher.drawGraph($scope.station);

          $scope.loadCalendar = function(){
            calCreate(rect,svg,$scope.myClass,$scope.stationData,day,week,percent,format,z,svg2)
          }
      });
});
    //console.log($scope.myClass)

  function calCreate(rect,svg,classT,data,day,week,percent,format,z,svg2){
          //console.log(svg)
    	wimCalendar.drawCalendar(rect,svg,parseData(data,classT),day,week,percent,format,z,svg2);
  		//console.log($scope.stateFips);
  		// data.rows.forEach(function(row){
  		// 	var date = row.f[0].v;
  		// 	var numTrucks = row.f[1].v;
  		// 	var month = row.f[2].v;
  		// 	var day = row.f[3].v;
  		// 	//console.log(date,numTrucks,month,day)
  			//console.log(row);
  			//var rowStation = row.f[0].v;
  			//$scope.stations.push({'stationId':row.f[1].v,'year':row.f[2].v,'months':row.f[3].v,'numTrucks':row.f[4].v});
  			
  			//if(getStationIndex(rowStation) == -1) {
  			//	$scope.stations.push({'stationId':rowStation, years:[]})
  			//}
  			//$scope.stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
  			//count++;
  		//}); 
  	
  //var dateD = new Date();
  //monthPath(dateD);
  };

function parseData(input,classInfo){
	var output = [];
  var totalRows = 0
	input.rows.forEach(function(row){
    totalRows++
    if(classInfo == 0 || classInfo == row.f[4].v){
    		var item = {}
        var x = 0
    		var string = ""
        var yearStr = row.f[5].v
        if(row.f[5].v < 10){
          yearStr = "0"+row.f[5].v
        }
    		if(row.f[2].v < 10){
    	        if(row.f[3].v < 10){
    	        	string= "20"+yearStr+"-0"+row.f[2].v+"-0"+row.f[3].v
    	        }else{
    	        	string = "20"+yearStr+"-0"+row.f[2].v+"-"+row.f[3].v
    	        }
    	 	}else{
    	        if(row.f[3].v < 10){
    	        	string = "20"+yearStr+"-"+row.f[2].v+"-0"+row.f[3].v
    	        }else{
    	        	string = "20"+yearStr+"-"+row.f[2].v+"-"+row.f[3].v
    	        }
    		}

            for(var i = 0;i<output.length;i++){
              if(output[i].date == string){
                output[i].numTrucks = parseInt(row.f[1].v) + parseInt(output[i].numTrucks)
                output[i].totalWeight = parseInt(row.f[6].v) + parseInt(output[i].totalWeight)
                x = 1
                break
              }
            }
            if(x == 0){
              item.date = string;
              item.numTrucks = parseInt(row.f[1].v);
              item.totalWeight = parseInt(row.f[6].v)
              item.averageWeight = 0
              output.push(item);
            }
            x = 0 
         }

        
	});
  for(var i = 0;i<output.length;i++){
    output[i].averageWeight = output[i].totalWeight / output[i].numTrucks
  }
 
	return output
};