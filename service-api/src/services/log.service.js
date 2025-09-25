const Log = require('../models/log.model');
const User = require('../models/user.model');

class LogService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['id', 'firstname', 'lastname'] }]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        return await Log.findAndCountAll(queryOptions);
    }

    static async findByUser(userId, options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['id', 'firstname', 'lastname'] }]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        return await Log.findAndCountAll(queryOptions);
    }

    static async findByStudent(studentId, options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            where: { target_id: studentId, target_type: 'student' },
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['id', 'firstname', 'lastname'] }]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        return await Log.findAndCountAll(queryOptions);
    }

    static async create({ userId, action, targetId, targetType, ip }) {
        return await Log.create({
            userId,
            action,
            target_id: targetId,
            target_type: targetType,
            ip_address: ip
        });
    }
}

module.exports = LogService;
