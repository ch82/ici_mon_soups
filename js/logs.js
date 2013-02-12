function parselogEntry(logEntry){
	rexp = /^HOST ALERT: (.+?);(DOWN|UP);(SOFT|HARD);\d+;.+$/.exec(logEntry.log_entry)
	return {'time':logEntry.timestamp,'host':rexp[1],'state':rexp[2]}
}
function getLog(start,end){
	var fulllogurl = "/cgi-bin/icinga/showlog.cgi?ts_start=0&ts_end=2147483647&query_string=HOST+ALERT&num_displayed=1000000&order=new2old&timeperiod=custom&noti=off&hst=on&sst=off&cmd=off&sms=off&evh=off&flp=off&dwn=off&jsonoutput";
	logs = {f:15};
	$.ajax({dataType:"json", url:fulllogurl, async:false,  success:function(j){
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
	var fulllogurl = "/cgi-bin/icinga/showlog.cgi?ts_start=0&ts_end=2147483647&query_string=HOST+ALERT&num_displayed=1000000&order=new2old&timeperiod=custom&noti=off&hst=on&sst=off&cmd=off&sms=off&evh=off&flp=off&dwn=off&jsonoutput";
	getLog(0,1)
})
