// controllers/user.controller.js
const UserService = require('../services/user.service');

class UserController {
    // Lấy danh sách người dùng (không search Meili nữa)
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;
            const offset = (page - 1) * pageSize;

            const result = await UserService.findAll({ offset, limit: pageSize });
            res.json({
                success: true,
                data: result.rows,
                total: result.count,
                page,
                pageSize
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async findById(req, res) {
        try {
            const data = await UserService.findById(req.params.id);
            res.json({ success: true, message: 'Lấy thông tin thành công', data });
        } catch (err) {
            res.status(404).json({ success: false, message: 'Không tìm thấy', error: err.message });
        }
    }

    async create(req, res) {
        try {
            const data = await UserService.create(req.body, req.file);
            res.json({ success: true, message: 'Thêm thành công', data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Thêm thất bại', error: err.message });
        }
    }

    async update(req, res) {
        try {
            const data = await UserService.update(req.params.id, req.body, req.file);
            res.json({ success: true, message: 'Cập nhật thành công', data });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: 'Cập nhật thất bại', error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await UserService.delete(req.params.id);
            if (deletedCount === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
            res.json({ success: true, message: 'Xóa thành công' });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: 'Xóa thất bại', error: err.message });
        }
    }
}

module.exports = new UserController();
