var calmod = 'day', repmod = 'logs', host2dispname = {}
function fillHostDescriptions(){
	$.ajax({dataType:"json", url:"/cgi-bin/icinga/status.cgi?style=hostdetail&jsonoutput", async:false, success:function(data){
		$.each(data.status.host_status,function(k,val){
			host2dispname[val.host] = val.host_display_name
		})
	}})
}
function printHost(host){
	return host2dispname[host]?host2dispname[host]:host
}
function onChange(){
	var datepick = $("#datepicker").data().datepicker
	var currdate = datepick.date
	switch (calmod) {
		case 'month':
			datepick.startViewMode=1
			datepick.minViewMode=1
			$("#period_div").html($.format.date(currdate,"MMMM yyyy"))
			if (repmod == 'logs')
				renderLog(getMonthLog(currdate.getFullYear(),currdate.getMonth()+1))
			if (repmod == 'stat')
				renderStat(getMonthStat(currdate.getFullYear(),currdate.getMonth()+1))
			break;
		case 'day':
			datepick.startViewMode=0
			datepick.minViewMode=0
			$("#period_div").html($.format.date(currdate,"dd MMMM yyyy"))
			if (repmod == 'logs')
				renderLog(getDayLog(new Date(currdate)))
			if (repmod == 'stat')
				renderStat(getDayStat(new Date(currdate)))
			break
	}
}

function calmodclick(t){
	calmod = t
	onChange()
}
function repmodclick(t){
	repmod = t
	onChange()
}
function renderLog(logs){
	$("#stat").parent().hide()
	$("#logs").parent().show()
	$("#logs").html("")
	var flatlog = []
	$.each(logs, function(k,vh){
		$.each(vh, function(k,ve){
			flatlog.push(ve)
		})
	})
	flatlog.sort(function(x,y){
		return x.time - y.time
	})
	var str = ''
	$.each(flatlog, function(k,l){
			var status = l.state.toLowerCase()
			str += "<tr><td class=t_center>"+l.time.toLocaleString()+'</td><td class=t_center>'+ printHost(l.host) +'</td><td class=t_center>'+
				 "<div class='status_block on'><span class='label label-"+ status +"'><i class='icon-arrow-"+ status +" icon-white'></i>"+ l.state +"</span></div>"
				+'</td><td class=t_center>'+ l.duration/1000+'s'+"</td></tr>"
		}
	)
	$("#logs").html(str)
}
function renderStat(stat){
	$("#logs").parent().hide()
	$("#stat").parent().show()
	$("#stat").html("")
	var str = ''
	for (host in stat) {
		var hs = stat[host]
		str += '<tr>'+'<td>'+printHost(host)+'</td>'+'<td>'+hs.summary/1000+'</td>'+'<td>'+hs.maxdur/1000+'</td>'+'<td>'+hs.countsum+'</td>'+'<td>'+hs.count30m+'</td>'+'<td>'+hs.count3h+'</td>'+'<td>'+hs.count6h+'</td>'+'</tr>'
	}
	$("#stat").html(str)
}
$(function() {
	$( "#datepicker").datepicker({/*viewMode:'months',minviewMod:'days',*/ format:'dd.mm.yyyy'}).on(
		'changeDate', function(ev){
			onChange()
		}
	)
	var now = new Date()
	$( "#datepicker").datepicker('setValue',new Date( now.getFullYear(), now.getMonth(),now.getDate() ))
	fillHostDescriptions()
	onChange()
});
