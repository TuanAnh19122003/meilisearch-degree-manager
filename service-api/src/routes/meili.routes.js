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
            indexes: ['roles', 'users', 'students'],
            expiresAt: null
        });
        res.json({ success: true, publicKey: key.key });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/student/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Xác định xem identifier là code hay email
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const filter = isEmail ? `email = "${identifier}"` : `code = "${identifier}"`;

        const searchResult = await studentIndex.search('', {
            filter,
            limit: 1
        });

        if (!searchResult.hits || searchResult.hits.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên với mã hoặc email này'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tìm sinh viên thành công',
            data: searchResult.hits[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm sinh viên',
            error: err.message
        });
    }
});

module.exports = router;
