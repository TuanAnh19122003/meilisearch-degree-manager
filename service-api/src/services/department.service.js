const Department = require('../models/department.model');

class DepartmentService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const departments = await Department.findAndCountAll(queryOptions);
        return departments;
    }

    static async findById(id) {
        const department = await Department.findOne({ where: { id } });
        if (!department) throw new Error("Không tìm thấy khoa");
        return department;
    }

    static async create(data) {
        const department = await Department.create(data);
        return department;
    }

    static async update(id, data) {
        const department = await Department.findOne({ where: { id: id } });
        if (!department) throw new Error("Không tìm thấy vai trò");
        return await department.update(data);
    }

    static async delete(id) {
        return await Department.destroy({ where: { id: id } })
    }

}

module.exports = DepartmentService;