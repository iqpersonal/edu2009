"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get basic analytics overview
router.get('/overview', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const schoolId = req.user.schoolId;
    // Get basic counts
    const [totalStudents, totalTeachers, totalAssessments, activeAcademicYears] = await Promise.all([
        index_1.prisma.student.count({ where: { schoolId, isActive: true } }),
        index_1.prisma.user.count({
            where: {
                schoolId,
                isActive: true,
                role: { in: ['TEACHER', 'SUBJECT_COORDINATOR', 'HEAD_OF_SECTION'] }
            }
        }),
        index_1.prisma.assessment.count({
            where: {
                subject: { schoolId },
                isActive: true
            }
        }),
        index_1.prisma.academicYear.count({
            where: {
                schoolId,
                isActive: true
            }
        })
    ]);
    res.json({
        success: true,
        data: {
            overview: {
                totalStudents,
                totalTeachers,
                totalAssessments,
                activeAcademicYears,
            }
        }
    });
}));
// Get performance analytics (placeholder)
router.get('/performance', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        error: 'Performance analytics not yet implemented',
        message: 'This feature will be available in a future update'
    });
}));
exports.default = router;
//# sourceMappingURL=analytics.js.map