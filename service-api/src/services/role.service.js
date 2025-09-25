const Role = require('../models/role.model');

class RoleService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']]
        };

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
        return role;
    }

    static async update(id, data) {
        const role = await Role.findOne({ where: { id: id } });
        if (!role) throw new Error("Không tìm thấy vai trò");
        return await role.update(data);
    }

    static async delete(id) {
        return await Role.destroy({ where: { id: id } })
    }

}

module.exports = RoleService;