const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
