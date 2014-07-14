var barTable = {
	
	drawTable:function(cleanData){
		var data = JSON.parse(JSON.stringify(cleanData))
		var htmlCode = "<table class=\"table table-hover table-bordered\">";
		var min = data[0].years[0].year
		var max = data[0].years[0].year
		for(var x = 0;x<data.length;x++){
			for(var y = 0;y<data[x].years.length;y++){
				if(data[x].years[y].year < min){
					min = data[x].years[y].year
				}
				if(data[x].years[y].year >= max){
					max = data[x].years[y].year
				}
			}
			data[x].years.sort(compareYears)

		}
		var range = (parseInt(max) - parseInt(min)) + 1
		var displayedYear = parseInt(min)
		htmlCode = htmlCode + "<tr><th>Station ID</th>";
		for(var w = 0;w<range;w++){
			displayedYear = parseInt(min) + w
			if(displayedYear < 10){
				htmlCode = htmlCode +"<th>200"+displayedYear+"</th>"
			}
			else{
				htmlCode = htmlCode +"<th>20"+displayedYear+"</th>"
			}
		}
		htmlCode = htmlCode + "</tr>"
		var tracker = 0;
		for(var z = 0;z<data.length;z++){
			htmlCode = htmlCode + "<tr><th>"+data[z].stationId+"</th>";
			for(var zz = 0;zz<range;zz++){
				if(tracker<data[z].years.length){
					if(parseInt(data[z].years[tracker].year) == (parseInt(min)+zz)){
						htmlCode = htmlCode + "<th class=\"yearExists\"></th>"
						tracker++
					}
					else{
						htmlCode = htmlCode + "<th class=\"noYear\"></th>"
					}
				}
			}
			tracker = 0
			htmlCode = htmlCode + "</tr>";
		}
		$("#barTable").html(htmlCode);

		function compareYears(a, b) {
			return parseInt(a.year) - parseInt(b.year)
		}
	},	

	removeTable:function(){
		$("#barTable").html('')
	},

}