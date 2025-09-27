const MajorService = require('../services/major.service');

class MajorController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            let result;

            if (!page || !pageSize) {
                result = await MajorService.findAll();
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách chuyên ngành thành công',
                    data: result.rows,
                    total: result.count
                });
            }

            const offset = (page - 1) * pageSize;
            result = await MajorService.findAll({ offset, limit: pageSize });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách chuyên ngành thành công',
                data: result.rows,
                total: result.count,
                page,
                pageSize
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách chuyên ngành',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await MajorService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thông tin chuyên ngành thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyên ngành',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await MajorService.create(req.body);
            res.status(200).json({
                success: true,
                message: 'Thêm chuyên ngành thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm chuyên ngành thất bại',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await MajorService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật chuyên ngành thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật chuyên ngành thất bại',
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
                    message: 'Không tìm thấy chuyên ngành để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa chuyên ngành thành công'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xóa chuyên ngành",
                error: error.message
            });
        }
    }
}

module.exports = new MajorController();