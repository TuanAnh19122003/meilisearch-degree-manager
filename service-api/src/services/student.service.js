const Student = require('../models/student.model');
const Major = require('../models/major.model');
const path = require('path');
const fs = require('fs');
const { studentIndex } = require('../config/meili.client');

class StudentService {
    static async findAll({ offset = 0, limit = 20 } = {}) {
        return await Student.findAndCountAll({
            include: [{ model: Major, as: 'major', attributes: ['id', 'name'] }],
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        });
    }

    static async findById(id) {
        const student = await Student.findOne({
            where: { id },
            include: [{ model: Major, as: 'major', attributes: ['id', 'name'] }]
        });
        if (!student) throw new Error("Không tìm thấy student");
        return student;
    }

    static async create(data, file) {
        if (file) data.image = `uploads/${file.filename}`;

        const student = await Student.create(data);

        // Fetch lại đầy đủ quan hệ Major
        const fullStudent = await Student.findOne({
            where: { id: student.id },
            include: [{ model: Major, as: 'major', attributes: ['id', 'name'] }]
        });

        // Đồng bộ lên Meilisearch
        await studentIndex.addDocuments([{
            id: fullStudent.id,
            code: fullStudent.code,
            firstname: fullStudent.firstname,
            lastname: fullStudent.lastname,
            dob: fullStudent.dob,
            gender: fullStudent.gender,
            email: fullStudent.email,
            phone: fullStudent.phone,
            address: fullStudent.address,
            image: fullStudent.image,
            major: fullStudent.major ? { id: fullStudent.major.id, name: fullStudent.major.name } : null
        }]);

        return fullStudent;
    }

    static async update(id, data, file) {
        const student = await Student.findOne({
            where: { id },
            include: [{ model: Major, as: 'major', attributes: ['id', 'name'] }]
        });
        if (!student) throw new Error('Student không tồn tại');

        if (file) {
            if (student.image) {
                const oldImagePath = path.join(__dirname, '..', student.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        await student.update(data);

        // Fetch lại đầy đủ quan hệ Major
        const fullStudent = await Student.findOne({
            where: { id },
            include: [{ model: Major, as: 'major', attributes: ['id', 'name'] }]
        });

        // Đồng bộ lại Meilisearch
        await studentIndex.updateDocuments([{
            id: fullStudent.id,
            code: fullStudent.code,
            firstname: fullStudent.firstname,
            lastname: fullStudent.lastname,
            dob: fullStudent.dob,
            gender: fullStudent.gender,
            email: fullStudent.email,
            phone: fullStudent.phone,
            address: fullStudent.address,
            image: fullStudent.image,
            major: fullStudent.major ? { id: fullStudent.major.id, name: fullStudent.major.name } : null
        }]);

        return fullStudent;
    }

    static async delete(id) {
        const student = await Student.findOne({ where: { id } });
        if (!student) throw new Error('Student không tồn tại');

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
