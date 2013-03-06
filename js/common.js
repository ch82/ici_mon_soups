dict_host2addr = {}
$(document).ready(function() {
	$.ajax('/cgi-bin/icinga/config.cgi?type=hosts&expand=&jsonoutput', {
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
	return ''
		+ (day ? day + 'd ' : '')
		+ hour + ':'
		+ ('0' + min).slice(-2) + ':'
		+ ('0' + sec).slice(-2)
}
