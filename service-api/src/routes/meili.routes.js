// meili.routes.js
const express = require('express');
const router = express.Router();
const { client, studentIndex } = require('../config/meili.client');

// Lấy public key cho frontend
router.get('/public-key', async (req, res) => {
    try {
        if (!client) throw new Error('Meili client chưa khởi tạo');
        const key = await client.createKey({
            description: 'Public key for frontend',
            actions: ['search'],
            indexes: ['roles', 'users', 'students', 'certificates', 'courses', 'departments'],
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
        if (code) {
            // code là duy nhất nên lọc chính xác
            filterParts.push(`code = "${code}"`);
        }

        const filterQuery = filterParts.length ? filterParts.join(' AND ') : undefined;

        // keyword: chỉ dùng để search full-text (name, code đều được Meilisearch xử lý)
        const result = await departmentIndex.search(keyword || '', {
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


module.exports = router;
