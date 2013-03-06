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
