const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            include: { model: Role, as: 'role', attributes: ['id', 'name'] }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User không tồn tại' });
        }

        req.user = user;

        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
    }
}

module.exports = authMiddleware;
