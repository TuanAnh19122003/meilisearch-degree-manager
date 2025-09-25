const express = require('express');
const router = express.Router();
const controller = require('../controllers/log.controller');

router.get('/', controller.findAll);
router.get('/user/:id', controller.findByUser);
router.get('/student/:id', controller.findByStudent);
router.post('/', controller.create);

module.exports = router;
