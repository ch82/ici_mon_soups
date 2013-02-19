function getStat(start, end){
	return null
}
function getDayStat(day) {
	var start = day.valueOf()/1000;
	return cleanLog(getStat( start, start + 86400))
}
function getMonthStat(year,month) {
	var start = new Date(year, month - 1);
	var end = new Date(year, month) - 1;
	return cleanLog(getStat( start.valueOf()/1000, Math.floor(end/1000)))
}
