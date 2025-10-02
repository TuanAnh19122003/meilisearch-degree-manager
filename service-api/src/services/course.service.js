const Course = require('../models/course.model');
const courseIndex = require('../config/meili.client');

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
        await courseIndex.addDocuments([{
            id: course.id,
            code: course.code,
            name: course.name,
            credit: course.credit
        }]);

        return course;
    }

    static async update(id, data) {
        const course = await Course.findByPk(id);
        if (!course) throw new Error('Không tìm thấy vai trò');

        const updatedcourse = await Course.update(data);

        await courseIndex.updateDocuments([{
            id: updatedcourse.id,
            code: updatedcourse.code,
            name: updatedcourse.name,
            description: updatedcourse.description
        }]);

        return updatedcourse;
    }

    static async delete(id) {
        const deletedCount = await Course.destroy({ where: { id } });
        if (deletedCount > 0) await courseIndex.deleteDocument(id);
        return deletedCount;
    }

}

module.exports = CourseService;