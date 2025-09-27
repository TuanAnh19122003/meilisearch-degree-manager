const LogService = require('../services/log.service');

class LogController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            const result = await LogService.findAll({ page, pageSize });

            res.json({
                success: true,
                message: 'Lấy danh sách log thành công',
                data: result.rows,
                total: result.count
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async findByUser(req, res) {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            const result = await LogService.findByUser(userId, { page, pageSize });

            res.json({
                success: true,
                message: `Lịch sử thao tác của user ${userId}`,
                data: result.rows,
                total: result.count
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async findByStudent(req, res) {
        try {
            const studentId = req.params.id;
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            const result = await LogService.findByStudent(studentId, { page, pageSize });

            res.json({
                success: true,
                message: `Lịch sử thao tác của sinh viên ${studentId}`,
                data: result.rows,
                total: result.count
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async create(req, res) {
        try {
            const userId = req.user.id;
            const { action, targetId, targetType, ip } = req.body;

            const log = await LogService.create({ userId, action, targetId, targetType, ip });

            res.status(201).json({ success: true, message: 'Ghi log thành công', data: log });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Ghi log thất bại: ' + err.message });
        }
    }

    async delete(req, res) {
        const { id } = req.params;
        try {
            await LogService.delete(id);
            return res.status(200).json({
                success: true,
                message: 'Xóa log thành công'
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({
                success: false,
                message: err.message || 'Xóa log thất bại'
            });
        }
    }
}

module.exports = new LogController();
