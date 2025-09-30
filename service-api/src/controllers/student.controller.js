const StudentService = require('../services/student.service');

class StudentController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            let result;

            if (!page || !pageSize) {
                result = await StudentService.findAll();
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách học sinh thành công',
                    data: result.rows,
                    total: result.count
                });
            }

            const offset = (page - 1) * pageSize;
            result = await StudentService.findAll({ offset, limit: pageSize });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách sinh viên thành công',
                data: result.rows,
                total: result.count,
                page,
                pageSize
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách sinh viên',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const data = await StudentService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thông tin sinh viên thành công',
                data
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await StudentService.create(req.body, req.file);

            res.status(200).json({
                success: true,
                message: 'Thêm sinh viên thành công',
                data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm sinh viên thất bại',
            })
        }
    }

    async update(req, res) {
        try {
            const data = await StudentService.update(req.params.id, req.body, req.file);

            res.status(201).json({
                success: true,
                message: 'Cập nhật thành công',
                data
            })
        } catch (error) {
            console.log('Lỗi: ', error);
            res.status(401).json({
                success: false,
                message: error.message
            })
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedCount = await StudentService.delete(id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sinh viên để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa thành công'
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async total(req, res) {
        try {
            const result = await StudentService.findAll();
            res.json({ total: result.count });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Sinh viên theo ngành
    async byMajor(req, res) {
        try {
            const all = await StudentService.findAll();
            const map = {};

            all.rows.forEach(student => {
                const major = student.major?.name || 'Unknown';
                if (!map[major]) map[major] = 0;
                map[major]++;
            });

            const result = Object.keys(map).map(major => ({ major, count: map[major] }));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new StudentController();