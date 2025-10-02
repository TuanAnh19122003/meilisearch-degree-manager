const hashPassword = require('../utils/hashPassword');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const path = require('path');
const fs = require('fs');
const { userIndex } = require('../config/meili.client');

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
        const user = await User.findOne({
            where: { id },
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });
        if (!user) throw new Error('User không tồn tại');
        return user;
    }

    static async create(data, file) {
        if (data.password) data.password = await hashPassword(data.password);
        if (file) data.image = `uploads/${file.filename}`;

        const user = await User.create(data);

        // Fetch đầy đủ quan hệ Role
        const fullUser = await User.findOne({
            where: { id: user.id },
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });

        // Đồng bộ lên Meilisearch
        await userIndex.addDocuments([{
            id: fullUser.id,
            firstname: fullUser.firstname,
            lastname: fullUser.lastname,
            email: fullUser.email,
            phone: fullUser.phone,
            is_active: fullUser.is_active,
            image: fullUser.image,
            role: fullUser.role
                ? { id: fullUser.role.id, name: fullUser.role.name, code: fullUser.role.code }
                : null
        }]);

        return fullUser;
    }

    static async update(id, data, file) {
        const user = await User.findOne({ where: { id }, include: { model: Role, as: 'role' } });
        if (!user) throw new Error('User không tồn tại');

        if (data.password && data.password !== user.password) data.password = await hashPassword(data.password);
        else delete data.password;

        if (file) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, '..', user.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        await user.update(data);

        // Fetch lại đầy đủ quan hệ Role
        const fullUser = await User.findOne({
            where: { id },
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });

        // Đồng bộ lại Meilisearch
        await userIndex.updateDocuments([{
            id: fullUser.id,
            firstname: fullUser.firstname,
            lastname: fullUser.lastname,
            email: fullUser.email,
            phone: fullUser.phone,
            is_active: fullUser.is_active,
            image: fullUser.image,
            role: fullUser.role
                ? { id: fullUser.role.id, name: fullUser.role.name, code: fullUser.role.code }
                : null
        }]);

        return fullUser;
    }

    static async delete(id) {
        const user = await User.findOne({ where: { id } });
        if (!user) return 0;

        if (user.image) {
            const imagePath = path.join(__dirname, '..', user.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await User.destroy({ where: { id } });

        // Xóa khỏi Meilisearch
        await userIndex.deleteDocument(id);

        return true;
    }
}

module.exports = UserService;
