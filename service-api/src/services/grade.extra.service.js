const Grade = require('../models/grade.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');

class GradeExtraService {
    static async getGradesByStudent(studentId) {
        return await Grade.findAll({
            where: { studentId },
            include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'credit'] }],
            order: [['createdAt', 'ASC']]
        });
    }

    static async getStudentsByCourse(courseId) {
        const grades = await Grade.findAll({
            where: { courseId },
            include: [{ model: Student, as: 'student', attributes: ['id', 'firstname', 'lastname', 'code'] }],
            order: [['grade', 'DESC']]
        });
        return grades.map(g => g.student);
    }

    static async importGrades(dataArray) {
        const result = [];
        for (const item of dataArray) {
            const existing = await Grade.findOne({ where: { studentId: item.studentId, courseId: item.courseId } });
            if (existing) {
                result.push(await existing.update({ grade: item.grade }));
            } else {
                result.push(await Grade.create(item));
            }
        }
        return result;
    }
}

module.exports = GradeExtraService;
