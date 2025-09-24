const hashPassword = require('../utils/hashPassword');
const User = require('../models/user.model');
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

        const users = await User.findAndCountAll(queryOptions);
        return users;
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
        if (data.password) {
            data.password = await hashPassword(data.password);
        }
        if (file) {
            data.image = `uploads/${file.filename}`;
        }

        const user = await User.create(data);
        return user;
    }

    static async update(id, data, file) {
        const user = await User.findOne({ where: { id: id } });
        if (!user) throw new Error('User không tồn tại');

        if (data.password && data.password !== user.password) {
            data.password = await hashPassword(data.password);
        } else {
            delete data.password;
        }
        if (file) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, '..', user.image);

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            data.image = `uploads/${file.filename}`;
        }

        return await user.update(data)
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        if (user.image) {
            const imagePath = path.join(__dirname, '..', user.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        return await User.destroy({ where: { id } });
    }

}

module.exports = UserService;