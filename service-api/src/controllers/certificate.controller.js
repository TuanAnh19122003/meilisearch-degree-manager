const CertificateService = require('../services/certificate.service');

class CertificateController {
    async findAll(req, res) {
        try {
            const data = await CertificateService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách chứng chỉ thành công',
                data
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
            const data = await CertificateService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thông tin chứng chỉ thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy certificate',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await CertificateService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Thêm chứng chỉ thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm chứng chỉ thất bại',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await CertificateService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật chứng chỉ thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật chứng chỉ thất bại',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await CertificateService.delete(req.params.id);
            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy certificate để xóa'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Xóa chứng chỉ thành công'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi xóa',
                error: error.message
            });
        }
    }
}

module.exports = new CertificateController();
