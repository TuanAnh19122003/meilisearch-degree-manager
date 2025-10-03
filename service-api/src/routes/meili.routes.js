// meili.routes.js
const express = require('express');
const router = express.Router();
const { client, studentIndex, certificateIndex } = require('../config/meili.client');

// Lấy public key cho frontend
router.get('/public-key', async (req, res) => {
    try {
        if (!client) throw new Error('Meili client chưa khởi tạo');
        const key = await client.createKey({
            description: 'Public key for frontend',
            actions: ['search'],
            indexes: ['roles', 'users', 'students', 'certificates', 'courses', 'departments', 'majors'],
            expiresAt: null
        });
        res.json({ success: true, publicKey: key.key });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Certificate search / list (pagination + status + identifier)
router.get('/certificate', async (req, res) => {
    try {
        const { identifier, status, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let filterParts = [];
        if (identifier) {
            const isNumber = /^CERT-\d{6,}$/.test(identifier);
            if (isNumber) filterParts.push(`number = "${identifier}"`);
            else filterParts.push(`student.code = "${identifier}"`);
        }
        if (status) filterParts.push(`status = "${status}"`);

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        const result = await certificateIndex.search('', {
            filter: filterQuery,
            offset: Number(offset),
            limit: Number(pageSize)
        });

        if (identifier && (!result.hits || result.hits.length === 0)) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy certificate' });
        }

        res.json({
            success: true,
            data: result.hits,
            total: result.estimatedTotalHits ?? result.hits.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi tìm certificate', error: err.message });
    }
});

// Student search / list (pagination + code + email + keyword)
router.get('/student', async (req, res) => {
    try {
        const { code, email, keyword, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let filterParts = [];
        if (code) {
            filterParts.push(`code = "${code}"`);
        }
        if (email) {
            filterParts.push(`email = "${email}"`);
        }

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        const result = await studentIndex.search(keyword || '', {
            filter: filterQuery,
            offset: Number(offset),
            limit: Number(pageSize)
        });

        // Nếu tìm theo code/email mà không có kết quả thì trả về 404
        if ((code || email) && (!result.hits || result.hits.length === 0)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên'
            });
        }

        res.json({
            success: true,
            data: result.hits.map(s => ({
                ...s,
                major: s.major || { name: '-' }
            })),
            total: result.estimatedTotalHits ?? result.hits.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm student',
            error: err.message
        });
    }
});

router.get('/course', async (req, res) => {
    try {
        const { keyword, code, credit, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let filterParts = [];
        if (code) {
            filterParts.push(`code = "${code}"`);
        }
        if (credit) {
            filterParts.push(`credit = ${credit}`); // credit là số nên không cần ""
        }

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        // keyword -> search trên name hoặc code
        const result = await courseIndex.search(keyword || '', {
            filter: filterQuery,
            offset: Number(offset),
            limit: Number(pageSize)
        });

        if ((code || keyword) && (!result.hits || result.hits.length === 0)) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy môn học' });
        }

        res.json({
            success: true,
            data: result.hits,
            total: result.estimatedTotalHits ?? result.hits.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi tìm course', error: err.message });
    }
});

router.get('/department', async (req, res) => {
    try {
        const { keyword, code, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let filterParts = [];
        let searchQuery = keyword || '';

        if (code) {
            // Nếu có code thì KHÔNG search, chỉ filter chính xác
            filterParts.push(`code = "${code}"`);
            searchQuery = ''; // bỏ search để tránh ra nhiều kết quả
        }

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        const result = await departmentIndex.search(searchQuery, {
            filter: filterQuery,
            offset: Number(offset),
            limit: Number(pageSize)
        });

        if ((code || keyword) && (!result.hits || result.hits.length === 0)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban'
            });
        }

        res.json({
            success: true,
            data: result.hits,
            total: result.estimatedTotalHits ?? result.hits.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm department',
            error: err.message
        });
    }
});

router.get('/major', async (req, res) => {
    try {
        const { keyword, code, deptId, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let filterParts = [];
        let searchQuery = keyword || '';

        if (code) {
            // tìm chính xác theo code
            filterParts.push(`code = "${code}"`);
            searchQuery = '';
        }
        if (deptId) {
            filterParts.push(`deptId = ${deptId}`);
        }

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        // search trên name/code/dept.name
        const result = await majorIndex.search(searchQuery, {
            filter: filterQuery,
            offset: Number(offset),
            limit: Number(pageSize)
        });

        if ((code || keyword) && (!result.hits || result.hits.length === 0)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chuyên ngành'
            });
        }

        res.json({
            success: true,
            data: result.hits,
            total: result.estimatedTotalHits ?? result.hits.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm major',
            error: err.message
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Thiếu query q' });

        let students = [];
        let certificates = [];

        const isCertNumber = /^CERT-\d{6,}$/.test(q);

        if (isCertNumber) {
            // Nếu q là số certificate thì chỉ search certificate
            const exactCerts = await certificateIndex.search('', { filter: `number = "${q}"`, limit: 50 });
            certificates = exactCerts.hits || [];
        } else {
            // Trường hợp q là student code/email
            const exactStudentFilter = `code = "${q}" OR email = "${q}"`;
            const exactCertFilter = `number = "${q}"`;

            const exactStudents = await studentIndex.search('', { filter: exactStudentFilter, limit: 20 });
            const exactCerts = await certificateIndex.search('', { filter: exactCertFilter, limit: 50 });

            students = exactStudents.hits || [];
            certificates = exactCerts.hits || [];

            // --- Full-text search nếu không tìm thấy ---
            if (students.length === 0 && certificates.length === 0) {
                const studentFullText = await studentIndex.search(q, { limit: 20 });
                const certFullText = await certificateIndex.search(q, { limit: 50 });

                students = studentFullText.hits || [];
                certificates = certFullText.hits || [];

                // Nếu tìm được student từ full-text, lấy certificate liên quan
                if (students.length > 0) {
                    const studentCodes = students.map(s => `"${s.code}"`).join(',');
                    const certsByStudent = await certificateIndex.search('', { filter: `student.code IN [${studentCodes}]`, limit: 50 });
                    certificates = certsByStudent.hits || [];
                    students.forEach(s => {
                        s.certificates = certificates.filter(c => c.student.code === s.code);
                    });
                }
            } else if (students.length > 0) {
                // Nếu tìm được student bằng filter, gán certificate
                const studentCodes = students.map(s => `"${s.code}"`).join(',');
                const certsByStudent = await certificateIndex.search('', { filter: `student.code IN [${studentCodes}]`, limit: 50 });
                certificates = certsByStudent.hits || [];
                students.forEach(s => {
                    s.certificates = certificates.filter(c => c.student.code === s.code);
                });
            }
        }

        res.json({ success: true, student: students, certificates });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi khi tìm', error: err.message });
    }
});

module.exports = router;
