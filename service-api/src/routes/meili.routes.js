const express = require('express');
const router = express.Router();
const { client } = require('../config/meili.client');

router.get('/public-key', async (req, res) => {
    try {
        if (!client) throw new Error('Meili client chưa khởi tạo');
        const key = await client.createKey({
            description: 'Public key for frontend',
            actions: ['search'],
            indexes: ['roles', 'users'],
            expiresAt: null
        });
        res.json({ success: true, publicKey: key.key });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;
