'use strict';

angular
  .module('wimViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/state/:stateFips', {
        templateUrl: 'views/state.html',
        controller: 'StateCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
