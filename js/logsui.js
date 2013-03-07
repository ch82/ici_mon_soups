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
	var period
	$("#stat").parent().hide()
	$("#logs").parent().hide()
	$("#fails").parent().hide()
	switch (calmod) {
		case 'month':
			datepick.startViewMode=1
			datepick.minViewMode=1
			$("#period_div").html($.format.date(currdate,"MMMM yyyy"))
			period = getReportPeriod ([currdate.getFullYear(),currdate.getMonth()+1])
			break;
		case 'day':
			datepick.startViewMode=0
			datepick.minViewMode=0
			$("#period_div").html($.format.date(currdate,"dd MMMM yyyy"))
			period = getReportPeriod([currdate])
			break
	}
	switch (repmod){
		case 'logs':
			renderLog(getLog(period.start,period.end))
			break
		case 'stat':
			renderStat(getStat(period.start,period.end))
			break
		case 'fail':
			renderFails(sieveDurations(getViolations(period.start, period.end)),300000)
			break
		case 'fail30':
			renderFails(sieveDurations(getViolations(period.start, period.end)))
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
			str += '<tr>'
					+'<td class=t_center>'+l.time.toLocaleString()+'</td>'
					+'<td class=t_center>'+ printHost(l.host) +'</td>'
					+'<td class=t_center>'+ dict_host2addr[l.host] +'</td>'
					+'<td class=t_center>'+"<div class='status_block on'><span class='label label-"+ status +"'><i class='icon-arrow-"+ status +" icon-white'></i>"+ l.state +"</span></div>"+'</td>'
					+'<td class=t_center>'+ formatsecs(l.duration/1000) +"</td>"
				+'</tr>'
		}
	)
	$("#logs").html(str)
}
function renderStat(stat){
	$("#stat").parent().show()
	$("#stat").html("")
	var str = ''
	for (host in stat) {
		var hs = stat[host]
		str += '<tr>'
			+'<td>'+printHost(host)+'</td>'
			+'<td>'+dict_host2addr[host]+'</td>'
			+'<td>'+formatsecs(hs.summary/1000)+'</td>'
			+'<td>'+formatsecs(hs.maxdur/1000)+'</td>'
			+'<td>'+hs.countsum+'</td>'
			+'<td>'+hs.count30m+'</td>'
			+'<td>'+hs.count3h+'</td>'
			+'<td>'+hs.count6h+'</td>'
		+'</tr>'
	}
	$("#stat").html(str)
}

function renderFails(violations){
	$("#fails").parent().show()
	$("#fails").html("")
	var str = ''
	$.each(violations, function(k,viol){
		str += '<tr>'
			+ '<td>'+ viol.start.toLocaleString() +'</td>'
			+ '<td>'+ viol.end.toLocaleString() +'</td>'
			+ '<td>'+ formatsecs(viol.duration/1000) +'</td>'
			+ '<td>'+ printHost(viol.host) +'</td>'
			+ '<td>'+ dict_host2addr[viol.host] +'</td>'
		+'</tr>'
	})
	$("#fails").html(str)
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
