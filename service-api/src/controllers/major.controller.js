const MajorService = require('../services/major.service');

class MajorController {
    async findAll(req, res) {
        try {
            const data = await MajorService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await MajorService.create(req.body);
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
            const data = await MajorService.update(req.params.id, req.body);
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
            const deletedCount = await MajorService.delete(req.params.id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy major để xóa'
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

module.exports = new MajorController();