const express = require('express');
const router = express.Router();

const role = require('./role.routes');
const major = require('./major.routes');

router.use('/roles', role);
router.use('/majors', major);

module.exports = router;