function getAvail(start, end){
	var url="http:/cgi-bin/icinga/avail.cgi?&hostgroup=ping_group&timeperiod=custom&rpttimeperiod=&assumeinitialstates=yes&assumestateretention=yes&assumestatesduringnotrunning=yes&includesoftstates=no&initialassumedhoststate=0&initialassumedservicestate=0&backtrack=30&content_type=html%22&jsonoutput" +'&t1='+start+'&t2='+end
	var unavail=[]
	$.ajax({dataType:"json", url:url, async:false, success:function(data){
		$.each(data.avail.hostgroup_availability.hostgroup.hosts,function(k,avail){
			if(avail.percent_total_time_up===0.0){
				unavail.push({'host':avail.host_name,'duration':avail.total_time_down*1000})
			}
		})
	}})
	return unavail
}

function getStat(start, end){
	var statistik = {}
	var logs = cleanLog(getLog(start, end))
	var tempstat = getAvail(start,end)
	for (var h in logs){
		var lastevent = null
		for (var ev in logs[h]){
			var currevevent = logs[h][ev]
			if (currevevent.state == 'UP'){
				var error = { 'host':currevevent.host, 'duration':currevevent.duration}
				tempstat.push (error)
			}
			lastevent = currevevent
		}
		if (lastevent.state == 'DOWN') {
			tempstat.push ({ 'host':lastevent.host, 'duration': end*1000 - lastevent.time.valueOf()})
		}
	}
	$.each(tempstat,function(ind,val){
		if (!statistik[val.host])
			statistik[val.host] = {summary:0, maxdur:0, countsum:0, count30m:0, count3h:0, count6h:0}
		var incident = statistik[val.host]
		incident.summary += val.duration
		incident.countsum++
		if (incident.maxdur<val.duration) incident.maxdur = val.duration;
		if (val.duration>6*3600*1000) incident.count6h++;return;
		if (val.duration>3*3600*1000) incident.count3h++;return;
		if (val.duration>30*60*1000) incident.count30m++;return;
	})
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

$(document).ready(function() {
	$('.bs-docs-sidenav').affix();
});

