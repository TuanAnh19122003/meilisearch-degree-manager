const hashPassword = require('../utils/hashPassword');
const User = require('../models/user.model');
const roleIndex = require('../config/meili.client').roleIndex; // Nếu cần
const userIndex = require('../config/meili.client').userIndex;
const path = require('path');
const fs = require('fs');

class UserService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            include: {
                model: require('../models/role.model'),
                as: 'role',
                attributes: ['id', 'name', 'code']
            },
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        };

        return await User.findAndCountAll(queryOptions);
    }

    static async findById(id) {
        const user = await User.findOne({
            where: { id },
            include: [
                {
                    model: require('../models/role.model'),
                    as: 'role',
                    attributes: ['id', 'code', 'name']
                }
            ]
        });
        if (!user) throw new Error("Không tìm thấy user");
        return user;
    }

    static async create(data, file) {
        if (data.password) data.password = await hashPassword(data.password);
        if (file) data.image = `uploads/${file.filename}`;

        const user = await User.create(data);

        // Đồng bộ lên Meilisearch
        await userIndex.addDocuments([{
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            roleId: user.roleId
        }]);

        return user;
    }

    static async update(id, data, file) {
        const user = await User.findOne({ where: { id } });
        if (!user) throw new Error('User không tồn tại');

        if (data.password && data.password !== user.password) {
            data.password = await hashPassword(data.password);
        } else {
            delete data.password;
        }

        if (file) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, '..', user.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        const updatedUser = await user.update(data);

        // Cập nhật Meilisearch
        await userIndex.updateDocuments([{
            id: updatedUser.id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            phone: updatedUser.phone,
            roleId: updatedUser.roleId
        }]);

        return updatedUser;
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        if (user.image) {
            const imagePath = path.join(__dirname, '..', user.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        const deletedCount = await User.destroy({ where: { id } });

        // Xóa khỏi Meilisearch
        if (deletedCount > 0) await userIndex.deleteDocument(id);

        return deletedCount;
    }
}

module.exports = UserService;
