exports.url = function() {
    var url = 'http://www.meteorup.cn/';
    // build_start
    if (process.env.NODE_ENV === 'development') url = 'http://localhost:3000/';
    if (process.env.NODE_TEST === 'test') url = 'http://test.meteorup.cn/';
    // build_end
    return url;
}
