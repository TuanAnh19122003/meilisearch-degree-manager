const Department = require('../models/department.model');
const { departmentIndex } = require('../config/meili.client');

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
        await departmentIndex.addDocuments([{
            id: department.id,
            code: department.code,
            name: department.name,
        }]);
        return department;
    }

    static async update(id, data) {
        const department = await Department.findByPk(id);
        if (!department) throw new Error('Không tìm thấy vai trò');

        const updatedDepartment = await Department.update(data);

        await departmentIndex.updateDocuments([{
            id: updatedDepartment.id,
            code: updatedDepartment.code,
            name: updatedDepartment.name,
            description: updatedDepartment.description
        }]);

        return updatedDepartment;
    }

    static async delete(id) {
        const deletedCount = await Department.destroy({ where: { id } });
        if (deletedCount > 0) await departmentIndex.deleteDocument(id);
        return deletedCount;
    }

}

module.exports = DepartmentService;