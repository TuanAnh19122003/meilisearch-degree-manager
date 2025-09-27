const Major = require('../models/major.model');

class MajorService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            include: {
                model: require('../models/department.model'),
                as: 'department',
                attributes: ['id', 'name', 'code']
            },
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        };

        const users = await Major.findAndCountAll(queryOptions);
        return users;
    }

    static async findById(id) {
        const major = await Major.findOne({
            where: { id },
            include: [
                {
                    model: require('../models/department.model'),
                    as: 'department',
                    attributes: ['id', 'name']
                }
            ]
        });
        if (!major) throw new Error("Không tìm thấy chuyên ngành");
        return major;
    }

    static async create(data) {
        const major = await Major.create(data);
        return major;
    }

    static async update(id, data) {
        const major = await Major.findOne({ where: { id: id } });
        if (!major) throw new Error("Không tìm thấy major");
        return await major.update(data);
    }

    static async delete(id) {
        return await Major.destroy({ where: { id: id } })
    }

}

module.exports = MajorService;