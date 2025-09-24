const Major = require('../models/major.model');

class MajorService {
    static async findAll() {
        const data = await Major.findAll({
            order: [['createdAt', 'ASC']],
            include:[
                {
                    model: require('../models/department.model'),
                    as:'department',
                    attributes:['id','name']
                }
            ]
        });
        return data;
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