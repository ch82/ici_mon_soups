function parselogEntry(logEntry){
	rexp = /^HOST ALERT: (.+?);(DOWN|UP);(SOFT|HARD);\d+;.+$/.exec(logEntry.log_entry)
	return {'time':logEntry.timestamp,'host':rexp[1],'state':rexp[2]}
}
function generateURL(start,end,order,limit){
	if (!start) { start = '0' }
	if (!end) { end = '2147483647' }
	if (!order) { order = "old2new" }
	if (!limit) { limit = 1000000 }	
	return "/cgi-bin/icinga/showlog.cgi?ts_start="+ start+"&num_displayed="+limit+"&order="+order+"&ts_end="+end+"&query_string=HOST+ALERT&timeperiod=custom&noti=off&hst=on&sst=off&cmd=off&sms=off&evh=off&flp=off&dwn=off&jsonoutput";
}
function getLog(){
	logs = {};
	$.ajax({dataType:"json", url:generateURL(), async:false, success:function(j){
		rawlog = j.showlog.log_entries
		for (le in rawlog){
			l = parselogEntry(rawlog[le]);
			if (!(l.host in logs)) {
				logs[l.host] = [];
			}
			logs[l.host].push(l)
		}
	}})
	return logs;
}
$(document).ready(function(){
	getLog(0,2147483647)
})
