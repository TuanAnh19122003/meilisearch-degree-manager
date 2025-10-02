const Major = require('../models/major.model');
const Department = require('../models/department.model');
const { majorIndex } = require('../config/meili.client');

class MajorService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code']
                }
            ]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        return await Major.findAndCountAll(queryOptions);
    }

    static async findById(id) {
        const major = await Major.findOne({
            where: { id },
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'code']
                }
            ]
        });
        if (!major) throw new Error("Không tìm thấy chuyên ngành");
        return major;
    }

    static async create(data) {
        // Tạo major mới
        const major = await Major.create(data);

        // Fetch lại để có đầy đủ department
        const fullMajor = await Major.findOne({
            where: { id: major.id },
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name', 'code'] }
            ]
        });

        // Đồng bộ lên Meilisearch
        await majorIndex.addDocuments([{
            id: fullMajor.id,
            code: fullMajor.code,
            name: fullMajor.name,
            deptId: fullMajor.deptId,
            department: fullMajor.department
                ? { id: fullMajor.department.id, name: fullMajor.department.name, code: fullMajor.department.code }
                : null
        }]);

        return fullMajor;
    }

    static async update(id, data) {
        const major = await Major.findOne({ where: { id } });
        if (!major) throw new Error("Không tìm thấy chuyên ngành");

        await major.update(data);

        // Fetch lại để có đầy đủ department
        const fullMajor = await Major.findOne({
            where: { id },
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name', 'code'] }
            ]
        });

        // Đồng bộ lại Meilisearch
        await majorIndex.updateDocuments([{
            id: fullMajor.id,
            code: fullMajor.code,
            name: fullMajor.name,
            deptId: fullMajor.deptId,
            department: fullMajor.department
                ? { id: fullMajor.department.id, name: fullMajor.department.name, code: fullMajor.department.code }
                : null
        }]);

        return fullMajor;
    }

    static async delete(id) {
        const major = await Major.findOne({ where: { id } });
        if (!major) throw new Error("Không tìm thấy chuyên ngành");

        await Major.destroy({ where: { id } });

        // Xóa khỏi Meilisearch
        await majorIndex.deleteDocument(id);

        return true;
    }
}

module.exports = MajorService;
