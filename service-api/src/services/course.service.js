const Course = require('../models/course.model');

class CourseService {
    static async findAll() {
        const data = await Course.findAll({
            order: [['createdAt', 'ASC']]
        });
        return data;
    }

    static async findById(id) {
        const course = await Course.findOne({ where: { id } });
        if (!course) throw new Error("Không tìm thấy môn học");
        return course;
    }

    static async create(data) {
        const course = await Course.create(data);
        return course;
    }

    static async update(id, data) {
        const course = await Course.findOne({ where: { id: id } });
        if (!course) throw new Error("Không tìm thấy môn học");
        return await course.update(data);
    }

    static async delete(id) {
        return await Course.destroy({ where: { id: id } })
    }

}

module.exports = CourseService;