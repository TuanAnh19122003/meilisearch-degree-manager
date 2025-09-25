const Log = require('../models/log.model');

class LogService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'DESC']]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const logs = await Log.findAndCountAll({
            ...queryOptions,
            include: [
                {
                    model: require('../models/user.model'),
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname']
                }
            ]
        });
        return logs;
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
