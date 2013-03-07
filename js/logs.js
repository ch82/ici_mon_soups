function parselogEntry(logEntry){
	var rexp = /^HOST ALERT: (.+?);(DOWN|UP);(SOFT|HARD);\d+;.+$/.exec(logEntry.log_entry)
	return {'time': new Date(logEntry.timestamp*1000),'host':rexp[1],'state':rexp[2],'duration':0}
}

function getLog(start,end,order,limit,noprevseek,filter){
	function generateURL(){
		if (!start) { start = '0' }
		if (!end) { end = '2147483647' }
		if (!order) { order = "old2new" }
		if (!limit) { limit = 1000000 }
		if (!filter) { filter = 'HOST+ALERT'}
		return "/cgi-bin/icinga/showlog.cgi?ts_start="+ start+"&num_displayed="+limit+"&order="+order+"&ts_end="+end+"&query_string="+filter+"&timeperiod=custom&noti=off&hst=on&sst=off&cmd=off&sms=off&evh=off&flp=off&dwn=off&jsonoutput";
	}
	var logs = {};
	$.ajax({dataType:"json", url:generateURL(), async:false, success:function(j){
		var rawlog = j.showlog.log_entries
		for (le in rawlog){
			var l = parselogEntry(rawlog[le]);
			if (!(l.host in logs)) {
				logs[l.host] = [];
				if(!noprevseek && l.state=='UP') {
					var lstlog = getLog(null, l.time/1000-1, 'new2old', 1, true,'HOST+ALERT:+'+l.host+';')
					if(lstlog.hasOwnProperty(l.host)&&lstlog[l.host][0].state=='DOWN') 
						l.duration = l.time - lstlog[l.host][0].time;
				}
			}
			else {
				l.duration = l.time - logs[l.host][logs[l.host].length-1].time
			}
			logs[l.host].push(l)
		}
	}})
	cleanLog(logs)
	return logs;
}
function cleanLog(log) {
	for ( var hi in log) {
		var h = log[hi]
		var laststate = null
		var duration = 0
		for (var evi=0; evi<h.length;) {
			var ev = h[evi]
			if (ev.state == laststate){
				duration += h.splice(evi,1)[0].duration //possible type error if ''
			}
			else {
				laststate = ev.state
				ev.duration += duration
				duration = 0
				evi++
			}
		}
	}
	return log
}
