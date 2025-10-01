const hashPassword = require('../utils/hashPassword');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const path = require('path');
const fs = require('fs');

class UserService {
    static async findAll({ offset = 0, limit = 20 } = {}) {
        return await User.findAndCountAll({
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] },
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        });
    }

    static async findById(id) {
        const user = await User.findByPk(id, {
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });
        if (!user) throw new Error('User không tồn tại');
        return user;
    }

    static async create(data, file) {
        if (data.password) data.password = await hashPassword(data.password);
        if (file) data.image = `uploads/${file.filename}`;

        const user = await User.create(data);
        return await User.findByPk(user.id, {
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });
    }

    static async update(id, data, file) {
        const user = await User.findByPk(id, { include: { model: Role, as: 'role' } });
        if (!user) throw new Error('User không tồn tại');

        if (data.password && data.password !== user.password) data.password = await hashPassword(data.password);
        else delete data.password;

        if (file) {
            if (user.image) fs.existsSync(user.image) && fs.unlinkSync(path.join(__dirname, '..', user.image));
            data.image = `uploads/${file.filename}`;
        }

        await user.update(data);
        return await User.findByPk(user.id, { include: { model: Role, as: 'role' } });
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        if (user.image) fs.existsSync(user.image) && fs.unlinkSync(path.join(__dirname, '..', user.image));
        return await User.destroy({ where: { id } });
    }
}

module.exports = UserService;
