(function() {
	var wimXHR = {
		version: '0.1.0'
	}

	var _DATABASE = null;

	wimXHR.get = function(url, callback) {
		wimXHR.post(url, {database: _DATABASE}, callback);
	}

	wimXHR.post = function(url, data, callback) {
		data.database = _DATABASE;
		_getXHR(url).post(JSON.stringify(data), function(error, data) {
													callback(error, data);
												});
	}

	function _getXHR(url) {
		return d3.xhr(url).response(function(request) {
                    return JSON.parse(request.responseText);
                })
	}

	d3.json('./session.conf', function(error, config) {
        if (error) {
          console.log('Could not load config file', error);
          return;
        }
        _DATABASE = config.database;
    })

	this.wimXHR = wimXHR;
}) ()

/*

            d3.xhr(route + stationID)
                .response(function(request) {
                    return JSON.parse(request.responseText);
                })
                .post(JSON.stringify({'depth': depth}), function(error, data) {
                	if (error) {
                		console.log(error);
                		return;
                	}
                	time = TIMES[depth.length];

                	formattedData = _formatData(data);

                	_drawGraph();
                });

    
                */