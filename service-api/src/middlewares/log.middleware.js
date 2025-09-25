const LogService = require('../services/log.service');
const jwt = require('jsonwebtoken');
const getIp = require('../utils/getIp');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function logMiddleware(req, res, next) {
    if (req.originalUrl.startsWith('/api/auth/login') || req.originalUrl.startsWith('/api/auth/register')) {
        return next();
    }

    const actions = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!actions.includes(req.method)) {
        return next();
    }

    let userId = null;
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
        }
    } catch (err) {
        console.warn('Không decode được token để log:', err.message);
    }

    // Override res.json để lấy dữ liệu trả về từ controller
    const oldJson = res.json;
    res.json = function (body) {
        res.locals.responseBody = body;
        return oldJson.apply(this, arguments);
    }

    res.on('finish', async () => {
        try {
            const responseData = res.locals.responseBody;

            // data có thể là object hoặc mảng
            const data = responseData?.data;
            let targetId = null;

            if (data) {
                if (Array.isArray(data) && data[0]?.id) {
                    targetId = data[0].id;
                } else if (data?.id) {
                    targetId = data.id;
                }
            }

            // targetType từ URL (/api/roles → roles → role)
            const urlParts = req.originalUrl.split('/').filter(Boolean);
            let targetType = urlParts[1] || null;
            if (targetType) {
                targetType = targetType.replace(/s$/, '');
            }

            // lấy ip với utils
            const ip = getIp(req);

            await LogService.create({
                userId,
                action: req.method,
                targetId,
                targetType,
                ip
            });

        } catch (error) {
            console.error('Ghi log thất bại:', error.message);
        }
    });

    next();
}

module.exports = logMiddleware;
