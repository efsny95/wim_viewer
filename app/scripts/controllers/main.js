'use strict';

angular.module('wimViewerApp')
  .controller('MainCtrl', function ($scope,$http) {
  	$scope.states =[]
  	$http.get('http://localhost:1337/stations/byState').success(function(data, status, headers, config) {
  		console.log(data);
  		data.rows.forEach(function(row){
  			var rowState = row.f[0].v;
  			var rowStation = row.f[1].v;
  			if(getStateIndex(rowState) == -1) {
  				$scope.states.push({'state_fips':rowState, stations:[]})
  			}
  			$scope.states[getStateIndex(rowState)].stations.push({'stationID':rowStation,'stationCount':row.f[2].v});
  		}); 
  		console.log($scope.states);
  	})
  	function getStateIndex(state_fips){

  		return $scope.states.map(function(el) {return el.state_fips;}).indexOf(state_fips);
  	}
   
  });
