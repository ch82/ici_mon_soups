function getDuration(s) {
    var r=s.duration.match(/(\d+)d\s+(\d+)h\s+(\d+)m\s+(\d+)s/);
    return (r[1]*86400+r[2]*3600+r[3]*60+r[4]*1);
    //return new Date(0,0,r[1],r[2],r[3],r[4]);
}

function getRTA(s) {
    return /RTA\s+=\s*\d+\.\d+\s+ms$/.exec(s.status_information)[0];
}
function reprName(x){
	return x[x.t+'_display_name']
}
function makeQuery(){
    var hurl= settings.baseurl+"/status.cgi?hostgroup=" + settings.group + "&style=hostdetail&jsonoutput";
    var surl= settings.baseurl+"/status.cgi?servicegroup=" + settings.service_group + "&style=detail&jsonoutput";
    if(!makeQuery.hstatuses) makeQuery.hstatuses=[]
    if(!makeQuery.sstatuses) makeQuery.sstatuses=[]
	var hstatuses
    if (!this.hqry || $.inArray( this.hqry.state(), ["pending","resolved"])==-1)
		this.hqry = $.getJSON(hurl, function(res){
			makeQuery.hstatuses = res.status.host_status;
		});
    if (!this.sqry || $.inArray(this.sqry.state(),["pending","resolved"])==-1)
		this.sqry = $.getJSON(surl, function(res){
			makeQuery.sstatuses = res.status.service_status;
		});
	if (this.hqry && this.sqry && this.hqry.state()==this.sqry.state() && this.sqry.state()=="resolved")
	try {
		$("#hstates").empty();
		hstatuses = makeQuery.hstatuses.concat(makeQuery.sstatuses)
		$.each(hstatuses,function(k,v){
			if(v.service_description) { v.t='service' } else {v.t='host'}
			v.s='other'
			if($.inArray( v.status,['UP','OK'])!=-1) v.s='good'
			if($.inArray(v.status,['DOWN','WARNING','CRITICAL','UNREACHABLE'])!=-1) v.s='bad'
		})
		hstatuses.sort(function(x,y){
			if(x.s == 'good' && y.s == 'good'){
				if (x.host_display_name<y.host_display_name) return -1;
				if (x.host_display_name>y.host_display_name) return 1;
			}
			if(x.s == 'bad' && y.s == 'bad'){return getDuration(x)-getDuration(y);};
			if(x.s == 'bad'){return -1;};if(x.s == 'good'){return 1;};
		});

		prev_statuses = new Array();
		for(i=0; i < hstatuses.length; i++){
			prev_statuses[hstatuses[i].host_name] = hstatuses[i];
			if(hstatuses[i].s == 'bad' && temp_statuses[hstatuses[i].host_name] !== undefined){
					//если сервер изменил состояние на DOWN
					if(hstatuses[i].status != temp_statuses[hstatuses[i].host_name].status){
						beep();
						show_message(reprName(hstatuses[i]) + " изменил состояние на  DOWN");
					}
			}
			var pasteHtml = "";
			var status = hstatuses[i].status.toLowerCase();
			var status = hstatuses[i].s == 'good' ? 'up' : hstatuses[i].s == 'bad' ? 'down' : ''
			pasteHtml = "<tr>"
								+ "<td class='col1'>" + reprName(hstatuses[i]) +"</td>"
								+ "<td class='t_center'>"+ (hstatuses[i].t=='host' ? dict_host2addr[hstatuses[i].host_name]:'') +"</td>"
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
	}
	catch (err){}
	finally {
		this.hqry = this.sqry = null		
	}
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
		window.setInterval(makeQuery, settings.refresh_interval);
	makeQuery();

});
