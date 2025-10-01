const Role = require('../models/role.model');
const roleIndex = require('../config/meili.client'); // import Meilisearch client

class RoleService {
    static async findAll(options = {}) {
        const { offset, limit } = options;
        const queryOptions = { order: [['createdAt', 'ASC']] };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const roles = await Role.findAndCountAll(queryOptions);
        return roles;
    }

    static async findById(id) {
        const role = await Role.findOne({ where: { id } });
        if (!role) throw new Error("Không tìm thấy vai trò");
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
        const role = await Role.findOne({ where: { id } });
        if (!role) throw new Error("Không tìm thấy vai trò");

        const updatedRole = await role.update(data);

        // Cập nhật Meilisearch
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

        if (deletedCount > 0) {
            await roleIndex.deleteDocument(id);
        }

        return deletedCount;
    }
}

module.exports = RoleService;
