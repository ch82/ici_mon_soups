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
		$("#hstates").empty();
		var hstatuses = res.status.host_status;
		hstatuses.sort(function(x,y){
			if(x.status=='UP' && y.status=='UP'){
				if (x.host_display_name<y.host_display_name) return -1;
				if (x.host_display_name>y.host_display_name) return 1;
			}
			if(x.status=='DOWN' && y.status=='DOWN'){return getDuration(x)-getDuration(y);};
			if(x.status=="DOWN"){return -1;};if(x.status=="UP"){return 1;};
		});

		$.each(hstatuses , function (k,hstate){
			var pasteHtml = "";
			var status = hstate.status.toLowerCase();


			pasteHtml = "<tr>"
								+ "<td>" + hstate.host_display_name +"</td>"
								+ "<td class='t_center'>"+ dict_host2addr[hstate.host] +"</td>"
								+ "<td class='t_center'>"
								+ "		<div class='status_block on'><span class='label label-"+ status +"'><i class='icon-arrow-"+ status +" icon-white'></i>"+ hstate.status +"</span></div>"
								+ "</td>"
								+ "<td>"
								+ " <div>" + hstate.duration + "</div>";
			if (hstate.status=="UP") {
				pasteHtml += "<div>"+ getRTA(hstate) +"</div>";
			}

			pasteHtml += 	"<div>"+ hstate.last_check +"</div>"
										+ "</td>"
										+ "</tr>";		
			$("#hstates").append(pasteHtml);
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
