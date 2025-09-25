const express = require('express');
const router = express.Router();
const controller = require('../controllers/grade.extra.controller');

router.get('/student/:studentId', controller.getGradesByStudent);
router.get('/course/:courseId/students', controller.getStudentsByCourse);
router.post('/import', controller.importGrades);

module.exports = router;
