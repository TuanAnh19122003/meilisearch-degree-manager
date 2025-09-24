const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller');
const upload = require('../utils/multer');

router.get('/', controller.findAll);
router.post('/', upload.single('image'), controller.create);
router.put('/:id', upload.single('image'), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;