(function() {
    var wimgraph = {
        version: "0.0.1-alpha"
    };

    _Graph = (domID,url,stationID,options){
    	var self = this,
    	container = domID,
    	station_id =  stationID,
    	baseUrl = url,
    	svg = {},
    	type,
    	timeGroup,
    	startDate,
    	endDate,
    	groupBy,
    	filterBy,
    	parseDate,
    	formatYear,
    	formatDate;

    	if (typeof options !== 'undefined') {
    		type = options.type || 'stackedBar';
    		timeGroup = options.timeGroup || 'month'
    		startDate = options.startDate || null;
    		endDate = options.endDate || null;
    		groupBy = options.groupBy || [];
    		filterBy = options.filterBy || [];
    	} else {
    		type = 'stackedBar';
    		timeGroup = 'month'
    		startDate = null;
    		endDate =  null;
    		groupBy =  [];
    		filterBy = [];
    	}

    	var width = parseInt(d3.select(self.container).style('width')),
    		height = parseInt(d3.select(self.container).style('height'));
    	//---------------------------------------------------------------
    	// Private Functions
    	//---------------------------------------------------------------
    	function getData(callback){
    		postData = createPostData();
    		d3.json(baseUrl+'station_id');
				.post(JSON.stringify(postData),function(error,data)
					callback(parseData(data));
				});
    	}
    	function parseData(input){
    		
    		var output = [];

    		//Parse Date Based on time level data is summed to
    		switch(self.timeGroup){
    			case 'month':
						self.parseDate = d3.time.format("%Y-%m").parse;
					default:
						self.parseDate = d3.time.format("%Y-%m").parse;			
    		}
    		
    		input.rows.forEach(function(row){
    			output.push({'date':self.parseDate(row.f[0].v),'class':row.f[1].v,'value':row.f[2].v});
    		});
    		
    		return output;
    	}

    	//----------------------------------------------------------------
    	//Graph Drawing Functionsd
    	///---------------------------------------------------------------
    	function stackedBar(data){
    		console.log(data);
    	}
    	
    	function drawGraph(type,data){

    		switch(type) {
    			case 'stacekdBar':
    				stackedBar(data)
    			default:
    				stackedBar(data)
    		}
    	}

    	//----------------------------------------------------------------
    	// Initialize Graph
    	///---------------------------------------------------------------
    	self.svg = d3.select('#'+self.container).append("svg")
    		.attr("width", width )
    		.attr("height", height )
  		.append("g")
    		
    	
    	getData(function(wimdata){
    		drawGraph(self.type,data)
    	})
    }//_Graph
)()