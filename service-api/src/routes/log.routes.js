const express = require('express');
const router = express.Router();
const controller = require('../controllers/log.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', controller.findAll);
router.get('/user/:id', controller.findByUser);
router.get('/student/:id', controller.findByStudent);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
