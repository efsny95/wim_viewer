'use strict';

angular.module('wimViewerApp')
  .controller('StateCtrl', function ($scope,$routeParams) {
  	$scope.stateFips = $routeParams['stateFips']
  	$http.get('http://localhost:1337/stations/byState/'+stateFips).success(function(data, status, headers, config) {
  		console.log(data);
  	})
  });
