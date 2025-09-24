const Student = require('../models/student.model');
const Major = require('../models/major.model');
const path = require('path');
const fs = require('fs');

class StudentService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Major,
                    as: 'major',
                    attributes: ['name']
                }
            ]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const data = await Student.findAndCountAll(queryOptions);
        return data;
    }

    static async create(data, file) {
        if (file) {
            data.image = `uploads/${file.filename}`;
        }

        const student = await Student.create(data);
        return student;
    }

    static async update(id, data, file) {
        const student = await Student.findOne({ where: { id } });
        if (!student) throw new Error('student không tồn tại');

        if (file) {
            if (student.image) {
                const oldImagePath = path.join(__dirname, '..', student.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        const updated = await student.update(data);
        return updated;
    }

    static async delete(id) {
        const student = await Student.findOne({ where: { id } });
        if (!student) throw new Error('student không tồn tại');

        await Student.destroy({ where: { id } });
        return true;
    }
}

module.exports = StudentService;
