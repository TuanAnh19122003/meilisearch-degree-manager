const RoleService = require('../services/role.service');

class RoleController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 20;
            const search = req.query.search || '';

            let data, total;

            if (search) {
                const result = await RoleService.searchMeili(search, page, pageSize);
                data = result.hits;
                total = result.estimatedTotalHits;
            } else {
                const offset = (page - 1) * pageSize;
                const result = await RoleService.findAll({ offset, limit: pageSize });
                data = result.rows;
                total = result.count;
            }

            res.json({ success: true, data, total, page, pageSize });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách vai trò',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await RoleService.findById(req.params.id);
            res.json({ success: true, message: 'Lấy thông tin vai trò thành công', data });
        } catch (error) {
            res.status(404).json({ success: false, message: 'Không tìm thấy vai trò', error: error.message });
        }
    }

    async create(req, res) {
        try {
            const data = await RoleService.create(req.body);
            res.json({ success: true, message: 'Thêm vai trò thành công', data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Thêm thất bại', error: error.message });
        }
    }

    async update(req, res) {
        try {
            const data = await RoleService.update(req.params.id, req.body);
            res.json({ success: true, message: 'Cập nhật vai trò thành công', data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Cập nhật thất bại', error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await RoleService.delete(req.params.id);
            if (deletedCount === 0)
                return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò để xóa' });

            res.json({ success: true, message: 'Xóa vai trò thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Xóa thất bại', error: error.message });
        }
    }
}

module.exports = new RoleController();
