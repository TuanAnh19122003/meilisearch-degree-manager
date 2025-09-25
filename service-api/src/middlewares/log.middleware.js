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
            let targetId = null;

            if (responseData) {
                if (Array.isArray(responseData) && responseData[0]?.id) {
                    targetId = responseData[0].id;
                } else if (responseData?.id) {
                    targetId = responseData.id;
                } else if (responseData?.data?.id) {
                    targetId = responseData.data.id;
                }
            }

            const urlParts = req.originalUrl.split('/').filter(Boolean);
            let targetType = urlParts[urlParts.length - 1];
            if (!isNaN(targetType)) {
                targetType = urlParts[urlParts.length - 2];
            }
            if (targetType) {
                targetType = targetType.replace(/s$/, '');
            }

            const ip = getIp(req);

            await LogService.create({
                userId,
                action: req.method,
                targetId,
                targetType,
                ip
            });
        } catch (error) {
            console.error('Ghi log thất bại:', error);
        }
    });

    next();
}

module.exports = logMiddleware;
