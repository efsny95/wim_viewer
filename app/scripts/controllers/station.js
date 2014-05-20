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
    $scope.stationData = [];
    $scope.myClass = $scope.values[1].id;
    $http.get('http://localhost:1337/stations/byStation/'+$scope.station).success(function(data, status, headers, config) {
     $scope.stationData = data;
     calCreate($scope.myClass,data)
    });
    $scope.loadCalendar = function(){
      calCreate($scope.myClass,$scope.stationData)
    }
  });
    //console.log($scope.myClass)
  function calCreate(classT,data){
    	wimCalendar.drawCalendar(parseData(data,classT));
      console.log(classT)
      console.log(data)
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
	input.rows.forEach(function(row){
    if(classInfo == 0 || classInfo == row.f[4].v){
    		var item = {}
        var x = 0
    		var string = ""
    		if(row.f[2].v < 10){
    	        if(row.f[3].v < 10){
    	        	string= "20"+row.f[0].v[0]+row.f[0].v[1]+"-0"+row.f[2].v+"-0"+row.f[3].v
    	        }else{
    	        	string = "20"+row.f[0].v[0]+row.f[0].v[1]+"-0"+row.f[2].v+"-"+row.f[3].v
    	        }
    	 	}else{
    	        if(row.f[3].v < 10){
    	        	string = "20"+row.f[0].v[0]+row.f[0].v[1]+"-"+row.f[2].v+"-0"+row.f[3].v
    	        }else{
    	        	string = "20"+row.f[0].v[0]+row.f[0].v[1]+"-"+row.f[2].v+"-"+row.f[3].v
    	        }
    		}

            for(var i = 0;i<output.length;i++){
              if(output[i].date == string){
                output[i].numTrucks = parseInt(row.f[1].v) + parseInt(output[i].numTrucks)
                x = 1
                break
              }
            }
            if(x == 0){
              item.date = string;
              item.numTrucks = parseInt(row.f[1].v);
              output.push(item);
            }
            x = 0 
         }

        
	});
  console.log(output);
	return output
};