const express = require('express');
const router = express.Router();

const role = require('./role.routes');
const major = require('./major.routes');
const department = require('./department.routes');

router.use('/roles', role);
router.use('/majors', major);
router.use('/departments', department)

module.exports = router;