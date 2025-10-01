const Grade = require('../models/grade.model');

class GradeService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            include: [
                {
                    model: require('../models/student.model'),
                    as: 'student',
                    attributes: ['id', 'lastname', 'firstname', 'code']
                },
                {
                    model: require('../models/course.model'),
                    as: 'course',
                    attributes: ['id', 'name']
                }
            ],
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        };

        const grades = await Grade.findAndCountAll(queryOptions);
        return grades;
    }

    static async findById(id) {
        const grade = await Grade.findOne({
            where: { id },
            include: [
                {
                    model: require('../models/student.model'),
                    as: 'student',
                    attributes: ['id', 'lastname', 'firstname']
                },
                {
                    model: require('../models/course.model'),
                    as: 'course',
                    attributes: ['id', 'name']
                }
            ]
        });
        if (!grade) throw new Error("Không tìm thấy bảng điểm");
        return grade;
    }

    static async create(data) {
        const grade = await Grade.create(data);
        return grade;
    }

    static async update(id, data) {
        const grade = await Grade.findOne({ where: { id: id } });
        if (!grade) throw new Error("Không tìm thấy grade");
        return await grade.update(data);
    }

    static async delete(id) {
        return await Grade.destroy({ where: { id: id } })
    }
}

module.exports = GradeService;