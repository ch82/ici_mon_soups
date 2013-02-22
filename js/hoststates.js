function getDuration(s) {
    var r=s.duration.match(/(\d+)d\s+(\d+)h\s+(\d+)m\s+(\d+)s/);
    return (r[1]*86400+r[2]*3600+r[3]*60+r[4]*1);
    //return new Date(0,0,r[1],r[2],r[3],r[4]);
}

function getRTA(s) {
    return /RTA\s+=\s*\d+\.\d+\s+ms$/.exec(s.status_information)[0];
}

function makeQuery(){
    var url="/cgi-bin/icinga/status.cgi?hostgroup=ping_group&style=hostdetail&jsonoutput";
	$.getJSON(url, function(res){
		$("#hstates").html("");
		var hstatuses = res.status.host_status;
		hstatuses.sort(function(x,y){
			if(x.status==y.status){var diff=getDuration(x)-getDuration(y);return diff;};
			if(x.status=="DOWN"){return -1;};if(x.status=="UP"){return 1;};
		});
		$.each(hstatuses , function (k,hstate){
			var row=hstates.insertRow(-1);
			var chost=row.insertCell(0);
			var cstate=row.insertCell(1);
			var cduration=row.insertCell(2);
			chost.innerText = hstate.host_display_name
			chost.innerHTML += '<small> ['+dict_host2addr[hstate.host] + ']</small>';
			cstate.innerText = hstate.status;
			cduration.innerText = hstate.duration//getDuration(hstate)+'s';
			if (hstate.status=="DOWN") {
				row.className="error";
			}
			if (hstate.status=="UP") {
				row.className="success";
				cduration.innerHTML+="<br />" + getRTA(hstate);
				cduration.innerHTML+="<br />"+hstate.last_check;
			}	
		})
	});
}

dict_host2addr = {}
$(document).ready(function() {
	$.getJSON('/cgi-bin/icinga/config.cgi?type=hosts&expand=&jsonoutput',
		function(conf){
			$.each(conf.config.hosts, function(k,val){
				dict_host2addr[val.host_name] = val.address
			})
		})	
	window.setInterval(makeQuery,1000);
	makeQuery();
});
