'use strict';

angular.module('wimViewerApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams) {

    var state2fips = {"01": "Alabama","02": "Alaska","04": "Arizona","05": "Arkansas","06": "California","08": "Colorado","09": "Connecticut","10": "Delaware","11": "District of Columbia","12": "Florida","13": "Geogia","15": "Hawaii","16": "Idaho","17": "Illinois","18": "Indiana","19": "Iowa","20": "Kansas","21": "Kentucky","22": "Louisiana","23": "Maine","24": "Maryland","25": "Massachusetts","26": "Michigan","27": "Minnesota","28": "Mississippi","29": "Missouri","30": "Montana","31": "Nebraska","32": "Nevada","33": "New Hampshire","34": "New Jersey","35": "New Mexico","36": "New York","37": "North Carolina","38": "North Dakota","39": "Ohio","40": "Oklahoma","41": "Oregon","42": "Pennsylvania","44": "Rhode Island","45": "South Carolina","46": "South Dakota","47": "Tennessee","48": "Texas","49": "Utah","50": "Vermont","51": "Virginia","53": "Washington","54": "West Virginia","55": "Wisconsin","56": "Wyoming"};


    /*
    THINGS THAT SHOULD BE ADDED:

    Error message of some kind when trying to display data for classes of trucks or years of data that don't exist

    */


    //$scope.barGraph;

    //Used to select type of bar graph

    $scope.barType = [
      { id: "Year", label:'Year'},
      { id: "Weight", label:'Weight'},
    ];

    //Used when displaying over weight truck data not as a line graph only

    $scope.timePeriod = [

      { id:"year", label:'Year'},
      { id:"month", label:'Month'},
      { id:"day", label:'Day'},

    ];

    //Below is used to select between hourly and monthly data

    $scope.timePeriod2 = [

      { id:"hour",label:"Hourly"},
      { id:"month",label:"Monthly"},

    ];

    //Method of organization for overweight truck data

    $scope.time_order =[

    { id:"count",label:'Count'},
    { id:"percent",label:'Percent'},

    ];

    //Whether to display over weight data as a line or bar graph

    $scope.line = [

    { id:"on",label:'Yes'},
    { id:"off",label:'No'}

    ];

    $scope.line2 = [

    { id:"on",label:'Yes'},
    { id:"off",label:'No'}

    ];


    //Avaiable classes of trucks

    $scope.truckClass = [
              { id: 1, label: '1' },
              { id: 2, label: '2' },
              { id: 3, label: '3' },
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

    //List of years you can select data from.

    $scope.yearList = [
      { id:"--",label:'No Year'},
      { id:"00",label:'2000'},
      { id:"01",label:'2001'},
      { id:"02",label:'2002'},
      { id:"03",label:'2003'},
      { id:"04",label:'2004'},
      { id:"05",label:'2005'},
      { id:"06",label:'2006'},
      { id:"07",label:'2007'},
      { id:"08",label:'2008'},
      { id:"09",label:'2009'},
      { id:"10",label:'2010'},
      { id:"11",label:'2011'},
      { id:"12",label:'2012'},
      { id:"13",label:'2013'},
      { id:"14",label:'2014'},
    ];

    //Types of vehicle data you can select for the bar graph when year is selected

    $scope.vehicleTypeArr = [
              { id: [true,false,false,false], label: 'All'},
              { id: [false,true,false,false], label: 'APT'},
              { id: [false,true,true,false], label: 'APT and ASU'},
              { id: [false,true,false,true], label: 'APT and ATT'},
              { id: [false,false,true,false], label: 'ASU'},
              { id: [false,false,true,true], label: 'ASU and ATT'},
              { id: [false,false,false,true], label: 'ATT'},
    ];
    $scope.vehicleTypeArr2 = [
              { id: "All", label: 'All'},
              { id: "APT", label: 'APT'},
              { id: "ASU", label: 'ASU'},
              { id: "ATT", label: 'ATT'},

    ]

    //The myBarType variabe is used to determine whether you are using weight or year data
    
    $scope.myBarType = $scope.barType[0].id

    //Display data only used with weight data

    $scope.myTruckClass = $scope.truckClass[0].id
    
    //Display data only used with year data

    $scope.myVehicleTypeArr = $scope.vehicleTypeArr[0].id
    $scope.myYearA = $scope.yearList[0].id
    $scope.myYearB = $scope.yearList[0].id
    
    //Display data used with both line and bar graph

    $scope.myLine = $scope.line[1].id
    $scope.myOrder = $scope.time_order[0].id

    //Display data used only with bar graph

    $scope.myTimePeriod = $scope.timePeriod[0].id

    //Used for AADT line graph

    $scope.myMonthlyTraffic = $scope.vehicleTypeArr2[0].id

    //Used to select which type of data gets displayed: Hourly or monthly

    $scope.myTimePeriod2 = $scope.timePeriod2[0].id
    $scope.myLine2 = $scope.line2[1].id

    /*
      The following three variables are used to make sure multiple get requests aren't made
      so that the data you are working with is not as redundant. They are initially set
      to the string FR which is short for "first run." This is so that the first time the
      code is ran, there are no errors that may occur.

      curState is to be used to indicate the current state for when the state being examined is changed
    */
    $scope.curYearWeight = "FR"
    $scope.curLine = "FR"
    $scope.curState = "Blank"

    //Below are the arrays used to hold data to be displayed in the graphs. Was having trouble with watch and apply
    //so this is part of my work around.
   
    $scope.stationsClass = [];
    $scope.stationsWeight = [];
    $scope.overWeightTrucks = [];
    $scope.stationsMonthlyTraffic = [];
    $scope.stationsHourlyTraffic = [];

    
    var states = {};
    var yearArr = [];
    var URL = '/stations/byState',
        dataSources = 0,
        numRoutes = 2;

    wimXHR.get(URL, function(error, data) {

        data.rows.forEach(function(row){
            var rowState = row.f[0].v;
            var rowStation = row.f[1].v;


            if (!(rowState in states)) {
                states[rowState] = {
                    'state_fips': rowState, 
                    stations: {length: 0},
                    name: state2fips[rowState]
                };
            }
            var obj = {
                stationID: rowStation,
                stationCount: row.f[2].v,
                stationType: 'wim'
            }
            if (!(rowStation in states[rowState].stations)) {
                states[rowState].stations[rowStation] = obj;
                states[rowState].stations.length++;
            } else {
                states[rowState].stations[rowStation].stationType = 'wim';

            }
        });
        if (++dataSources == numRoutes) {
            wimstates.drawMap('#statesDIV', states, $scope);
        }
    })

    URL = '/stations/allClass';

    $("#barGraph").on("mousemove", function(e) {
     
      var x = e.pageX - 80;
      var y = e.pageY;
      var windowH = $(window).height();
      if (y > (windowH - 100)) {
      var y = e.pageY - 120;
      } else {
      var y = e.pageY - 120;
      }

      $("#stationInfo").css({
        "left": x,
        "top": y
      });
    });
    





    wimXHR.get(URL, function(error, data) {
        data.rows.forEach(function(row){
            var rowState = row.f[0].v;
            var rowStation = row.f[1].v;

            if (!(rowState in states)) {
                states[rowState] = {
                    'state_fips': rowState, 
                    stations: {length: 0},
                    name: state2fips[rowState]
                };
            }
            var obj = {
                stationID: rowStation,
                stationCount: row.f[2].v,
                stationType: 'class'
            }
            if (!(rowStation in states[rowState].stations)) {
                states[rowState].stations[rowStation] = obj;
                states[rowState].stations.length++;
            }
        });
        if (++dataSources == numRoutes) {
            wimstates.drawMap('#statesDIV', states, $scope);
        }
    })

    // get state data
    // wimXHR.get(URL, function(error, data) {
    //     data.rows.forEach(function(row){
    //         var rowState = row.f[0].v;
    //         var rowStation = row.f[1].v;
    //         if(getStateIndex(rowState) == -1) {
    //           $scope.states.push({'state_fips':rowState, stations:[], name: state2fips[rowState]})
    //         }
    //         var obj = {
    //             stationID: rowStation,
    //             stationCount: row.f[2].v,
    //             stationType: 'wim'
    //         }
    //         $scope.states[getStateIndex(rowState)].stations.push(obj);
    //     });
    //     if (++drawMap == 1) {
    //         wimstates.drawMap('#statesDIV', $scope.states, $scope);
    //     }
    // })

    // function getStateIndex(state_fips){
    //   return $scope.states.map(function(el) {return el.state_fips;}).indexOf(state_fips);
    // }
  });

