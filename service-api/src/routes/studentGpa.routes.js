const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentGpa.controller');

router.get('/', controller.findAll);
router.get('/:id', controller.findById);

module.exports = router;
