const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificatePrint.controller');

router.get('/print', controller.findAll);
router.get('/:studentId', controller.findByStudentId);

module.exports = router;
