'use strict';

angular.module('wimViewerApp')
  .controller('StateCtrl', function ($scope,$http,$routeParams) {
  	$scope.stateFips = $routeParams['stateFips']
  	$scope.stations = []
 	//var count = 0
  	$http.get('http://localhost:1337/stations/byState/'+$scope.stateFips).success(function(data, status, headers, config) {
  		//console.log($scope.stateFips);
  		data.rows.forEach(function(row){
  			/*var stateFip = row.f[0].v;
  			var stationId = row.f[1].v;
  			var year = row.f[2].v;
  			var month = row.f[3].v;
  			var numTrucks = row.f[4].v;*/
  			//console.log(row);
  			var rowStation = row.f[0].v;
  			//$scope.stations.push({'stationId':row.f[1].v,'year':row.f[2].v,'months':row.f[3].v,'numTrucks':row.f[4].v});
  			
  			if(getStationIndex(rowStation) == -1) {
  				$scope.stations.push({'stationId':rowStation, years:[]})
  			}
  			$scope.stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
  			//count++;
  		}); 
  	})
  	function getStationIndex(stationID){
  		return $scope.stations.map(function(el) {return el.stationId;}).indexOf(stationID);
  	}
  });
