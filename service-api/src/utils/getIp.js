function getClientIp(req) {
    let ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip;

    // Nếu IP dạng IPv6 (::ffff:127.0.0.1) thì lấy phần IPv4
    if (ip && ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1];
    }

    // Nếu localhost IPv6 (::1) thì đổi thành 127.0.0.1
    if (ip === '::1') {
        ip = '127.0.0.1';
    }

    return ip;
}

module.exports = getClientIp;
