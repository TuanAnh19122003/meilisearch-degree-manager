const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificatePrint.controller');
const upload = require('../utils/multer');

router.get('/print', controller.findAll);
router.get('/:studentId', controller.findByStudentId);

router.post('/upload/:certificateId', upload.single('file'), controller.uploadFile);
router.post('/generate', controller.generatePDF);

module.exports = router;
