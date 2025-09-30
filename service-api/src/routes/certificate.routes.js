const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificate.controller');

router.get('/stats-by-status', controller.statsByStatus);
router.get('/stats-by-year', controller.statsByYear);
router.get('/recent', controller.recent);
router.get('/count', controller.total);


router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
