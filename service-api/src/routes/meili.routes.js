const express = require('express');
const router = express.Router();
const { client } = require('../config/meili.client');

router.get('/public-key', async (req, res) => {
    try {
        const key = await client.createKey({
            description: 'Frontend search-only key for users',
            actions: ['search'],
            indexes: ['users'],
            expiresAt: null
        });

        res.json({ success: true, publicKey: key.key });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Không tạo được public key', error: err.message });
    }
});

module.exports = router;
