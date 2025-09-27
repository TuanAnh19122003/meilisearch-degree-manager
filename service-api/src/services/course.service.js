const Course = require('../models/course.model');

class CourseService {
    static async findAll(options = {}) {
        const { offset, limit } = options;

        const queryOptions = {
            order: [['createdAt', 'ASC']]
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const courses = await Course.findAndCountAll(queryOptions);
        return courses;
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