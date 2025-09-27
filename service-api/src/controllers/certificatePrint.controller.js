const CertificatePrintService = require('../services/certificatePrint.service');

class CertificatePrintController {
    async findAll(req, res) {
        try {
            const data = await CertificatePrintService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy tất cả văn bằng thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu văn bằng',
                error: error.message
            });
        }
    }

    async findByStudentId(req, res) {
        try {
            const data = await CertificatePrintService.findByStudentId(req.params.studentId);
            res.status(200).json({
                success: true,
                message: 'Lấy văn bằng của sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy văn bằng cho sinh viên này',
                error: error.message
            });
        }
    }
}

module.exports = new CertificatePrintController();
