const express = require('express');
const router = express.Router();
const logMiddleware = require('../middlewares/log.middleware');

const role = require('./role.routes');
const major = require('./major.routes');
const department = require('./department.routes');
const course = require('./course.routes');
const user = require('./user.routes');
const student = require('./student.routes');
const grade = require('./grade.routes');
const certificate = require('./certificate.routes');
const log = require('./log.routes');
const auth = require('./auth.routes');

const studentgpa = require('./studentGpa.routes');
const gradeExtra = require('./grade.extra.routes');

router.use(logMiddleware);
router.use('/roles', role);
router.use('/majors', major);
router.use('/departments', department);
router.use('/courses', course);
router.use('/users', user);
router.use('/students', student);
router.use('/grades', grade);
router.use('/certificates', certificate);
router.use('/logs', log);
router.use('/auth', auth);

router.use('/student-gpa', studentgpa);
router.use('/grades', gradeExtra);

module.exports = router;