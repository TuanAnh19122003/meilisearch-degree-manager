const GradeExtraService = require('../services/grade.extra.service');

class GradeExtraController {
    async getGradesByStudent(req, res) {
        try {
            const data = await GradeExtraService.getGradesByStudent(req.params.studentId);
            res.status(200).json({
                success: true,
                message: 'Lấy bảng điểm sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy bảng điểm',
                error: error.message
            });
        }
    }

    async getStudentsByCourse(req, res) {
        try {
            const data = await GradeExtraService.getStudentsByCourse(req.params.courseId);
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách sinh viên theo môn thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách sinh viên',
                error: error.message
            });
        }
    }

    async importGrades(req, res) {
        try {
            const data = await GradeExtraService.importGrades(req.body);
            res.status(200).json({
                success: true,
                message: 'Import bảng điểm thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Import bảng điểm thất bại',
                error: error.message
            });
        }
    }
}

module.exports = new GradeExtraController();
