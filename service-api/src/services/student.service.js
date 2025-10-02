const Student = require('../models/student.model');
const Major = require('../models/major.model');
const path = require('path');
const fs = require('fs');
const { studentIndex } = require('../config/meili.client');

class StudentService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Major,
                    as: 'major',
                    attributes: ['id', 'name']
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

    static async findById(id) {
        const student = await Student.findOne({
            where: { id },
            include: [
                {
                    model: require('../models/major.model'),
                    as: 'major',
                    attributes: ['id', 'name']
                }
            ]
        });
        if (!student) throw new Error("Không tìm thấy student");
        return student;
    }


    static async create(data, file) {
        if (file) {
            data.image = `uploads/${file.filename}`;
        }

        const student = await Student.create(data, {
            include: [{ model: Major, as: 'major' }]
        });

        // Đồng bộ lên Meilisearch
        await studentIndex.addDocuments([{
            id: student.id,
            code: student.code,
            firstname: student.firstname,
            lastname: student.lastname,
            dob: student.dob,
            gender: student.gender,
            email: student.email,
            phone: student.phone,
            address: student.address,
            image: student.image,
            major: student.major ? { id: student.major.id, name: student.major.name } : null
        }]);

        return student;
    }

    static async update(id, data, file) {
        const student = await Student.findOne({
            where: { id },
            include: [{ model: Major, as: 'major' }]
        });
        if (!student) throw new Error('student không tồn tại');

        if (file) {
            if (student.image) {
                const oldImagePath = path.join(__dirname, '..', student.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        const updated = await student.update(data);

        // Đồng bộ lại Meilisearch
        await studentIndex.updateDocuments([{
            id: updated.id,
            code: updated.code,
            firstname: updated.firstname,
            lastname: updated.lastname,
            dob: updated.dob,
            gender: updated.gender,
            email: updated.email,
            phone: updated.phone,
            address: updated.address,
            image: updated.image,
            major: updated.major ? { id: updated.major.id, name: updated.major.name } : null
        }]);

        return updated;
    }

    static async delete(id) {
        const student = await Student.findOne({ where: { id } });
        if (!student) throw new Error('student không tồn tại');

        if (student.image) {
            const imagePath = path.join(__dirname, '..', student.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Student.destroy({ where: { id } });
        // Đồng bộ xóa lên Meilisearch
        await studentIndex.deleteDocument(id);

        return true;
    }
}

module.exports = StudentService;
