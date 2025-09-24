const StudentGpaService = require('../services/studentGpa.service');

class StudentGpaController {
    async findAll(req, res) {
        try {
            const data = await StudentGpaService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy GPA toàn bộ sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy GPA',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await StudentGpaService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy GPA sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy GPA cho sinh viên này',
                error: error.message
            });
        }
    }
}

module.exports = new StudentGpaController();
