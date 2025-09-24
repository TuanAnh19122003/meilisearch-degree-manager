const express = require('express');
const router = express.Router();

const role = require('./role.routes');
const major = require('./major.routes');
const department = require('./department.routes');
const course = require('./course.routes');

router.use('/roles', role);
router.use('/majors', major);
router.use('/departments', department);
router.use('/courses', course);

module.exports = router;