'use strict';

angular.module('wimViewerApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams) {

    var state2fips = {"01": "Alabama","02": "Alaska","04": "Arizona","05": "Arkansas","06": "California","08": "Colorado","09": "Connecticut","10": "Delaware","11": "District of Columbia","12": "Florida","13": "Geogia","15": "Hawaii","16": "Idaho","17": "Illinois","18": "Indiana","19": "Iowa","20": "Kansas","21": "Kentucky","22": "Louisiana","23": "Maine","24": "Maryland","25": "Massachusetts","26": "Michigan","27": "Minnesota","28": "Mississippi","29": "Missouri","30": "Montana","31": "Nebraska","32": "Nevada","33": "New Hampshire","34": "New Jersey","35": "New Mexico","36": "New York","37": "North Carolina","38": "North Dakota","39": "Ohio","40": "Oklahoma","41": "Oregon","42": "Pennsylvania","44": "Rhode Island","45": "South Carolina","46": "South Dakota","47": "Tennessee","48": "Texas","49": "Utah","50": "Vermont","51": "Virginia","53": "Washington","54": "West Virginia","55": "Wisconsin","56": "Wyoming"};
    $scope.states =[];
    $scope.barGraph;
    var URL = '/stations/byState';

    wimXHR.get(URL, function(error, data) {

        data.rows.forEach(function(row){
            var rowState = row.f[0].v;
            var rowStation = row.f[1].v;
            if(getStateIndex(rowState) == -1) {
              $scope.states.push({'state_fips':rowState, stations:[]})

            }
            $scope.states[getStateIndex(rowState)].stations.push({'stationID':rowStation,'stationCount':row.f[2].v});
        }); 
        $scope.states.forEach(function(state){
            state.name = state2fips[state.state_fips];
        })

        wimstates.drawMap('#statesDIV', $scope.states, $scope);

    })

    $scope.$watch('stations', function() {
      
      if($scope.stations != undefined){
          if($scope.stations.length == 0){
            //Clear out bar graph
            //barGraph.drawBarGraph($scope.barGraph,"clean");
            
          }
          
        }
      else{
            $scope.barGraph = barGraph.initBarGraph();
            
        }

    });

    function getStateIndex(state_fips){
      return $scope.states.map(function(el) {return el.state_fips;}).indexOf(state_fips);
    }

    $("#barGraph").on("mousemove", function(e) {
     
      var x = e.pageX - 80;
      var y = e.pageY;
      var windowH = $(window).height();
      if (y > (windowH - 100)) {
      var y = e.pageY - 70;
      } else {
      var y = e.pageY - 70;
      }

      $("#stationInfo").css({
        "left": x,
        "top": y
      });
    });
    
  });



