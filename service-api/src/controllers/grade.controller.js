const GradeService = require('../services/grade.service');

class GradeController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            let result;

            if (!page || !pageSize) {
                result = await GradeService.findAll();
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách bảng điểm thành công',
                    data: result.rows,
                    total: result.count
                });
            }

            const offset = (page - 1) * pageSize;
            result = await GradeService.findAll({ offset, limit: pageSize });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách bảng điểm thành công',
                data: result.rows,
                total: result.count,
                page,
                pageSize
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await GradeService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thông tin bảng điểm thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảng điểm',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await GradeService.create(req.body);
            res.status(200).json({
                success: true,
                message: 'Thêm thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm thất bại',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await GradeService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật thất bại',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await GradeService.delete(req.params.id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy grade để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa thành công'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xóa",
                error: error.message
            });
        }
    }

}

module.exports = new GradeController();