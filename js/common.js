dict_host2addr = {}
$(document).ready(function() {
	$.ajax( settings.baseurl+'/config.cgi?type=hosts&expand=&jsonoutput', {
		async: false,
		success: function(conf) {
			$.each(conf.config.hosts, function(k, val) {
				dict_host2addr[val.host_name] = val.address
			})
		}
	})
})
function formatsecs(secs) {
	var day = Math.floor(secs/86400)
	var hour = Math.floor(secs%86400/3600)
	var min = Math.floor(secs%3600/60)
	var sec = Math.floor(secs%60)
	if (!secs) return ''
	return ''
		+ (day ? day + 'd ' : '')
		+ hour + ':'
		+ ('0' + min).slice(-2) + ':'
		+ ('0' + sec).slice(-2)
}

function getReportPeriod(period){
	switch (period.length){
		case 1:
			var day = period[0]
			var start = day.valueOf()/1000
			var end = start + 86400
			break;
		case 2:
			var year = period[0]
			var month = period[1]
			var start = new Date(year, month - 1).valueOf()/1000
			var end = Math.floor((new Date(year, month) - 1)/1000)
			break
	}
	return {start:start, end:end}
}
