function getAvail(start, end){
	var url="/cgi-bin/icinga/avail.cgi?&hostgroup=ping_group&timeperiod=custom&rpttimeperiod=&assumeinitialstates=yes&assumestateretention=yes&assumestatesduringnotrunning=yes&includesoftstates=no&initialassumedhoststate=0&initialassumedservicestate=0&backtrack=30&content_type=html%22&jsonoutput" +'&t1='+start+'&t2='+end
	var unavail=[]
	$.ajax({dataType:"json", url:url, async:false, success:function(data){
		$.each(data.avail.hostgroup_availability.hostgroup.hosts,function(k,avail){
			if(avail.percent_total_time_down==100){
				unavail.push({'start':new Date(start*1000),'end':new Date(end*1000),'host':avail.host_name,'duration':avail.total_time_down*1000})
			}
		})
	}})
	return unavail
}

function getViolations(start, end){
	var logs = getLog(start, end)
	var tempstat = getAvail(start,end)
	for (var h in logs){
		var lastevent = null
		for (var ev in logs[h]){
			var currevevent = logs[h][ev]
			if (currevevent.state == 'UP'){
				var error = { 'host':currevevent.host, 'duration':currevevent.duration, 'end':currevevent.time, 'start':new Date(currevevent.time-currevevent.duration)}
				tempstat.push (error)
			}
			lastevent = currevevent
		}
		if (lastevent.state == 'DOWN') {
			tempstat.push ({ 'host':lastevent.host, 'duration':(end*1000 - lastevent.time.valueOf()), start:lastevent.time, end:new Date(end*1000)})
		}
	}
	return tempstat
}

function getStat(start, end){
	var statistik = {}
	var tempstat = getViolations(start, end)
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

$(document).ready(function() {
	$('.bs-docs-sidenav').affix();
});

function sieveDurations(inlog, limit){
	if (!limit) limit = 30*60*1000
	var sievedlog = []
	for (var eventindex in inlog) {
		var levent = inlog[eventindex]
		if (levent.duration >= limit)
			sievedlog.push(levent)
	}
	return sievedlog
}
