function formatDate(flag) {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = '' + d.getHours(),
        minutes = '' +  d.getMinutes();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    if (hour.length < 2) 
        hour = '0' + hour;
    if (minutes.length < 2) 
        minutes = '0' + minutes;
    if (flag)
        return [hour, minutes].join(':');

    return [year, month, day].join('-');
}

module.exports = formatDate;