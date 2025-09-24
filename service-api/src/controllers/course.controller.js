const CourseService = require('../services/course.service');

class RoleController {
    async findAll(req, res) {
        try {
            const data = await CourseService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách môn học thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách môn học',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await CourseService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thông tin môn học thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy môn học',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await CourseService.create(req.body);
            res.status(200).json({
                success: true,
                message: 'Thêm môn học thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm môn học thất bại',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await CourseService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật môn học thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật môn học thất bại',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await CourseService.delete(req.params.id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy môn học để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa môn học thành công'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xóa môn học",
                error: error.message
            });
        }
    }
}

module.exports = new RoleController();