var barTable = {
	
	drawTable:function(cleanData){
		console.log(cleanData)
		var data = JSON.parse(JSON.stringify(cleanData))
		var htmlCode = ""
		for(var i = 0;i<data.length;i++){
			htmlCode = htmlCode+"<label>"+data[i].state+"</label><br><table class=\"table table-hover table-bordered\">";
			var min = parseInt(data[i].stations[0].years[0].year)
			var max = parseInt(data[i].stations[0].years[0].year)
			var color = d3.scale.quantize()
				.domain([0,100])
				.range(colorbrewer.RdYlGn[11]);	
			for(var x = 0;x<data[i].stations.length;x++){
				for(var y = 0;y<data[i].stations[x].years.length;y++){
					if(parseInt(data[i].stations[x].years[y].year) < min){
						min = parseInt(data[i].stations[x].years[y].year)
					}
					if(parseInt(data[i].stations[x].years[y].year) >= max){
						max = parseInt(data[i].stations[x].years[y].year)
					}
				}
				//data[i].stations[x].years.sort(compareYears)

			}
			var range = (max - min) + 1
			var displayedYear = min
			htmlCode = htmlCode + "<tr><th>Station ID</th>";
			for(var w = 0;w<range;w++){
				for(var ww = 1;ww<13;ww++){
					displayedYear = min + w
					if(displayedYear < 10){
						htmlCode = htmlCode +"<th>"+ww+"/0"+displayedYear+"</th>"
					}
					else{
						htmlCode = htmlCode +"<th>"+ww+"/"+displayedYear+"</th>"
					}
				}
			}
			htmlCode = htmlCode + "</tr>"
			var tracker = 0;
			for(var z = 0;z<data[i].stations.length;z++){
				htmlCode = htmlCode + "<tr><th>"+data[i].stations[z].stationId+"</th>";
				for(var zz = 0;zz<range;zz++){
					if(tracker<data[i].stations[z].years.length){
						if(parseInt(data[i].stations[z].years[tracker].year) == (parseInt(min)+zz)){
							for(var zzz = 0;zzz<12;zzz++){
								if(parseInt(data[i].stations[z].years[tracker].months[zzz]) > 0){
									var percent = 0
									if(zzz == 0 || zzz == 2 || zzz == 4 || zzz == 6 || zzz == 7 || zzz == 9 || zzz == 11){
										percent = (parseInt(data[i].stations[z].years[tracker].months[zzz])/31) * 100
									}
									else if(zzz == 3 || zzz == 5 || zzz == 8 || zzz == 10){
										percent = (parseInt(data[i].stations[z].years[tracker].months[zzz])/31) * 100
									}
									else{
										percent = (parseInt(data[i].stations[z].years[tracker].months[zzz])/31) * 100
									}
									htmlCode = htmlCode + "<th bgcolor="+color(percent)+"></th>"
								}
								else{
									htmlCode = htmlCode + "<th class=\"noYear\"></th>"
								}
							}
							tracker++
						}
					}
				}
				tracker = 0
				htmlCode = htmlCode + "</tr>";
			}
			htmlCode = htmlCode + "</table>"
		}
		console.log(data)
		$("#barTable").html(htmlCode);

		// function compareYears(a, b) {
		// 	return parseInt(a.year) - parseInt(b.year)
		// }
	},	

	removeTable:function(){
		$("#barTable").html('')
	},

}