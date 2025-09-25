const LogService = require('../services/log.service');

class LogController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            let result;
            if (!page || !pageSize) {
                result = await LogService.findAll();
            } else {
                const offset = (page - 1) * pageSize;
                result = await LogService.findAll({ offset, limit: pageSize });
            }

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách log thành công',
                data: result.rows,
                total: result.count
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async findByUser(req, res) {
        try {
            const { id } = req.params;
            const result = await LogService.findByUser(id);
            res.status(200).json({
                success: true,
                message: `Lịch sử thao tác của user ${id}`,
                data: result.rows,
                total: result.count
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async findByStudent(req, res) {
        try {
            const { id } = req.params;
            const result = await LogService.findByStudent(id);
            res.status(200).json({
                success: true,
                message: `Lịch sử thay đổi dữ liệu của sinh viên ${id}`,
                data: result.rows,
                total: result.count
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const userId = req.user.id;
            const { action, targetId, targetType, ip } = req.body;

            const data = await LogService.create({
                userId,
                action,
                targetId,
                targetType,
                ip
            });

            res.status(201).json({
                success: true,
                message: 'Ghi log thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Ghi log thất bại: ' + error.message
            });
        }
    }

}

module.exports = new LogController();
