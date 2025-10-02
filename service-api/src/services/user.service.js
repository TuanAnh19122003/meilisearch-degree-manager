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
        const userWithRole = await User.findByPk(user.id, {
            include: { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        });

        // Đồng bộ lên Meilisearch
        await userIndex.addDocuments([{
            id: userWithRole.id,
            firstname: userWithRole.firstname,
            lastname: userWithRole.lastname,
            email: userWithRole.email,
            phone: userWithRole.phone,
            is_active: userWithRole.is_active,
            image: userWithRole.image,
            role: userWithRole.role ? { id: userWithRole.role.id, name: userWithRole.role.name, code: userWithRole.role.code } : null
        }]);

        return userWithRole;
    }

    static async update(id, data, file) {
        const user = await User.findByPk(id, { include: { model: Role, as: 'role' } });
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

        const updated = await user.update(data);

        // Đồng bộ lại Meilisearch
        await userIndex.updateDocuments([{
            id: updated.id,
            firstname: updated.firstname,
            lastname: updated.lastname,
            email: updated.email,
            phone: updated.phone,
            is_active: updated.is_active,
            image: updated.image,
            role: updated.role ? { id: updated.role.id, name: updated.role.name, code: updated.role.code } : null
        }]);

        return await User.findByPk(id, { include: { model: Role, as: 'role' } });
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        // Xóa ảnh nếu có
        if (user.image) {
            const imagePath = path.join(__dirname, '..', user.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        const deletedCount = await User.destroy({ where: { id } });

        if (deletedCount > 0) await userIndex.deleteDocument(id);

        return deletedCount;
    }
}

module.exports = UserService;
