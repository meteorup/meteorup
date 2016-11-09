exports.url = function() {
    var url = 'http://www.meteorup.cn/';
    if (process.env.METEORUP_SERVER_HOST) url = process.env.METEORUP_SERVER_HOST;
    return url;
}
