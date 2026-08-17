const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const authFaculty = [verifyToken, requireRole('faculty', 'admin')];

router.get('/overview', authFaculty, facultyController.getOverview);
router.get('/students', authFaculty, facultyController.getStudents);
router.get('/students/:id/report', authFaculty, facultyController.getStudentReport);
router.post('/assignments', authFaculty, facultyController.createAssignment);
router.get('/assignments', authFaculty, facultyController.getAssignments);
router.get('/analytics', authFaculty, facultyController.getAnalytics);
router.get('/plagiarism/:contestId', authFaculty, facultyController.plagiarismReport);

module.exports = router;
