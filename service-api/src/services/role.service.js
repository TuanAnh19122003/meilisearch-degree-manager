const Role = require('../models/role.model');
const { roleIndex } = require('../config/meili.client');

class RoleService {
    static async findAll({ offset, limit } = {}) {
        const options = { order: [['createdAt', 'ASC']] };
        if (offset !== undefined && limit !== undefined) {
            options.offset = offset;
            options.limit = limit;
        }
        const result = await Role.findAndCountAll(options);
        return result;
    }

    static async findById(id) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Không tìm thấy vai trò');
        return role;
    }

    static async create(data) {
        const role = await Role.create(data);

        await roleIndex.addDocuments([{
            id: role.id,
            code: role.code,
            name: role.name,
            description: role.description
        }]);

        return role;
    }

    static async update(id, data) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Không tìm thấy vai trò');

        const updatedRole = await role.update(data);

        await roleIndex.updateDocuments([{
            id: updatedRole.id,
            code: updatedRole.code,
            name: updatedRole.name,
            description: updatedRole.description
        }]);

        return updatedRole;
    }

    static async delete(id) {
        const deletedCount = await Role.destroy({ where: { id } });
        if (deletedCount > 0) await roleIndex.deleteDocument(id);
        return deletedCount;
    }

    static async searchMeili(query = '', page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const results = await roleIndex.search(query, { offset, limit: pageSize });

        return {
            hits: results.hits.map(r => ({ ...r })),
            estimatedTotalHits: results.estimatedTotalHits
        };
    }
}

module.exports = RoleService;
