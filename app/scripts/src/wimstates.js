(function() {
	var wimstates = {
		version: 0.1
	}

	var mapDIV = null,
		SVG = null,
		geoJSON = null;

	function _drawMap() {
		//console.log(geoJSON)
		var states = SVG.selectAll('path')
			.data(geoJSON.features)
	}

	wimstates.drawMap = function(id) {
		mapDIV = d3.select(id);

		SVG = mapDIV.append('svg')
			.attr('height', '500px')
			.attr('width', '700px')

		d3.json('./us-states-10m.json', function(error, states) {

			geoJSON = topojson.feature(states, states.objects.states)

			_drawMap();
		})
	}

	this.wimstates = wimstates;
})()