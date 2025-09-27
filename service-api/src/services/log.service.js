const Log = require('../models/log.model');
const User = require('../models/user.model');

class LogService {
    static async findAll({ page, pageSize } = {}) {
        const options = {
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }
            ]
        };

        if (page && pageSize) {
            options.offset = (page - 1) * pageSize;
            options.limit = pageSize;
        }

        return await Log.findAndCountAll(options);
    }

    static async findByUser(userId, { page, pageSize } = {}) {
        const options = {
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }
            ]
        };
        if (page && pageSize) {
            options.offset = (page - 1) * pageSize;
            options.limit = pageSize;
        }
        return await Log.findAndCountAll(options);
    }

    static async findByStudent(studentId, { page, pageSize } = {}) {
        const options = {
            where: { target_id: studentId, target_type: 'student' },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }
            ]
        };
        if (page && pageSize) {
            options.offset = (page - 1) * pageSize;
            options.limit = pageSize;
        }
        return await Log.findAndCountAll(options);
    }

    static async create({ userId, action, targetId = null, targetType = null, ip = null }) {
        return await Log.create({
            userId,
            action,
            target_id: targetId,
            target_type: targetType,
            ip_address: ip
        });
    }

    static async delete(logId) {
        const log = await Log.findByPk(logId);
        if (!log) {
            throw new Error('Log không tồn tại');
        }
        await log.destroy();
        return true;
    }
}

module.exports = LogService;
