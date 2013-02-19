function getStat(start, end){
	var statistik = {}
	var l = cleanLog(getLog(start, end))
	for (var h in l){
		var lastevent = null, tempstat = []
		for (var ev in l[h]){
			var currevevent = l[h][ev]
			if (currevevent.state == 'UP'){
				var error = { 'host':currevevent.host, 'duration':currevevent.duration}
				tempstat.push (error)
			}
			lastevent = currevevent
		}
		var incident = {summary:0, maxdur:0, countsum:0, count30m:0, count3h:0, count6h:0}
		tempstat.forEach(function(val,ind,obj){
			incident.summary += val.duration
			incident.countsum++
			if (incident.maxdur<val.duration) incident.maxdur = val.duration;
			if (val.duration>6*3600*1000) incident.count6h++;return;
			if (val.duration>3*3600*1000) incident.count3h++;return;
			if (val.duration>30*60*1000) incident.count30m++;return;
		})
		statistik[h] = incident
	}
	return statistik
}

function getDayStat(day) {
	var start = day.valueOf()/1000;
	return getStat( start, start + 86400)
}

function getMonthStat(year,month) {
	var start = new Date(year, month - 1);
	var end = new Date(year, month) - 1;
	return getStat( start.valueOf()/1000, Math.floor(end/1000))
}
