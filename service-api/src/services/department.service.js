const Department = require('../models/department.model');
const { departmentIndex } = require('../config/meili.client');

class DepartmentService {
    static async findAll({ offset = 0, limit = 20 } = {}) {
        return await Department.findAndCountAll({
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        });
    }

    static async findById(id) {
        const department = await Department.findOne({ where: { id } });
        if (!department) throw new Error("Không tìm thấy department");
        return department;
    }

    static async create(data) {
        const department = await Department.create(data);

        // Đồng bộ lên Meilisearch
        await departmentIndex.addDocuments([{
            id: department.id,
            code: department.code,
            name: department.name,
            description: department.description || null
        }]);

        return department;
    }

    static async update(id, data) {
        const department = await Department.findOne({ where: { id } });
        if (!department) throw new Error('Không tìm thấy department');

        await department.update(data);

        // Đồng bộ lại Meilisearch
        const updatedDepartment = await Department.findOne({ where: { id } });
        await departmentIndex.updateDocuments([{
            id: updatedDepartment.id,
            code: updatedDepartment.code,
            name: updatedDepartment.name,
            description: updatedDepartment.description || null
        }]);

        return updatedDepartment;
    }

    static async delete(id) {
        const department = await Department.findOne({ where: { id } });
        if (!department) throw new Error('Không tìm thấy department');

        await Department.destroy({ where: { id } });

        // Đồng bộ xóa lên Meilisearch
        await departmentIndex.deleteDocument(id);

        return true;
    }
}

module.exports = DepartmentService;
