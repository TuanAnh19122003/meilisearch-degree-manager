const express = require('express');
const router = express.Router();

const role = require('./role.routes');
const major = require('./major.routes');
const department = require('./department.routes');
const course = require('./course.routes');
const user = require('./user.routes');
const student = require('./student.routes');
const grade = require('./grade.routes');
const certificate = require('./certificate.routes');

const studentgpa = require('./studentGpa.routes');

router.use('/roles', role);
router.use('/majors', major);
router.use('/departments', department);
router.use('/courses', course);
router.use('/users', user);
router.use('/students', student);
router.use('/grades', grade);
router.use('/certificates', certificate);

router.use('/student-gpa', studentgpa);

module.exports = router;