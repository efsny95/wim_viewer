'use strict';

angular.module('wimViewerApp')
  .controller('StationCtrl', function ($scope,$http,$routeParams) {
    $scope.station = $routeParams['stationId']
  });
