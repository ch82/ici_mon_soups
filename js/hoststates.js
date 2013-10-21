function getDuration(s) {
    var r=s.duration.match(/(\d+)d\s+(\d+)h\s+(\d+)m\s+(\d+)s/);
    return (r[1]*86400+r[2]*3600+r[3]*60+r[4]*1);
    //return new Date(0,0,r[1],r[2],r[3],r[4]);
}

function getRTA(s) {
    return /RTA\s+=\s*\d+\.\d+\s+ms$/.exec(s.status_information)[0];
}

function makeQuery(){
    var url= settings.baseurl+"/status.cgi?hostgroup=" + settings.group + "&style=hostdetail&jsonoutput";
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

		prev_statuses = new Array();
		for(i=0; i < hstatuses.length; i++){
			prev_statuses[hstatuses[i].host_name] = hstatuses[i];
			if(hstatuses[i].status == "DOWN" && temp_statuses[hstatuses[i].host_name] !== undefined){
					//если сервер изменил состояние на DOWN
					if(hstatuses[i].status != temp_statuses[hstatuses[i].host_name].status){
						beep();
						show_message(hstatuses[i].host_display_name + " изменил состояние на  DOWN");
					}
			}
			var pasteHtml = "";
			var status = hstatuses[i].status.toLowerCase();
			pasteHtml = "<tr>"
								+ "<td class='col1'>" + hstatuses[i].host_display_name +"</td>"
								+ "<td class='t_center'>"+ dict_host2addr[hstatuses[i].host_name] +"</td>"
								+ "<td class='t_center'>"
								+ "		<div class='status_block on'><span class='label label-"+ status +"'><i class='icon-arrow-"+ status +" icon-white'></i>"+ hstatuses[i].status +"</span></div>"
								+ "</td>"
								+ "<td>"
								+ " <div>" + formatsecs(getDuration(hstatuses[i])) + "</div>";
			if (hstatuses[i].status=="UP") {
				pasteHtml += "<div>"+ getRTA(hstatuses[i]) +"</div>";
			}

			pasteHtml += 	"<div>"+ hstatuses[i].last_check +"</div>"
										+ "</td>"
										+ "</tr>";		
			$("#hstates").append(pasteHtml);
		}
		temp_statuses = prev_statuses;
	});
}

function beep () {
	 var thissound = document.getElementById("audio1");
		thissound.play();
		// alert("Канал передачи данных изменил состояние");
}

function show_message (mess_str) {
	$.gritter.add({
				title: 'Warning',
				text: mess_str,
				sticky: false,
				time: '25000',
				position: 'bottom-right'
			});
}
var temp_statuses;
$(document).ready(function() {
		$.extend($.gritter.options, {
		    position: 'bottom-right', 
		});
		temp_statuses = new Array();
		window.setInterval(makeQuery,2000);
	makeQuery();

});
