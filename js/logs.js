function parselogEntry(logEntry){
	var rexp = /^HOST ALERT: (.+?);(DOWN|UP);(SOFT|HARD);\d+;.+$/.exec(logEntry.log_entry)
	return {'time': new Date(logEntry.timestamp*1000),'host':rexp[1],'state':rexp[2]}
}

function getLog(start,end,order,limit){
	function generateURL(){
		if (!start) { start = '0' }
		if (!end) { end = '2147483647' }
		if (!order) { order = "old2new" }
		if (!limit) { limit = 1000000 }	
		return "/cgi-bin/icinga/showlog.cgi?ts_start="+ start+"&num_displayed="+limit+"&order="+order+"&ts_end="+end+"&query_string=HOST+ALERT&timeperiod=custom&noti=off&hst=on&sst=off&cmd=off&sms=off&evh=off&flp=off&dwn=off&jsonoutput";
	}
	var logs = {};
	$.ajax({dataType:"json", url:generateURL(), async:false, success:function(j){
		var rawlog = j.showlog.log_entries
		for (le in rawlog){
			var l = parselogEntry(rawlog[le]);
			if (!(l.host in logs)) {
				logs[l.host] = [];
			}
			logs[l.host].push(l)
		}
	}})
	return logs;
}
function cleanLog(log) {
	for ( var hi in log) {
		var h = log[hi]
		var laststate = null
		for (var evi=0; evi<h.length;) {
			ev = h[evi]
			if (ev.state == laststate){
				h.splice(evi,1)
			}
			else {
				laststate = ev.state
				evi++
			}
		}
	}
	return log
}
function getDayLog(day) {
	var start = day.valueOf()/1000;
	return cleanLog(getLog( start, start + 86400))
}
$(document).ready(function(){
	getLog(0,2147483647)
})
