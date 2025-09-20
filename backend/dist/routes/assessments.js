"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get assessments for current school
router.get('/', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, subjectId, term, academicYearId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let where = {
        subject: {
            schoolId: req.user.schoolId
        }
    };
    if (subjectId) {
        where.subjectId = subjectId;
    }
    if (term) {
        where.term = term;
    }
    if (academicYearId) {
        where.academicYearId = academicYearId;
    }
    const [assessments, total] = await Promise.all([
        index_1.prisma.assessment.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                title: true,
                type: true,
                maxScore: true,
                term: true,
                date: true,
                isActive: true,
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                _count: {
                    select: {
                        results: true,
                    }
                }
            },
            orderBy: { date: 'desc' }
        }),
        index_1.prisma.assessment.count({ where })
    ]);
    res.json({
        success: true,
        data: {
            assessments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
// Create assessment (placeholder)
router.post('/', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        error: 'Assessment creation not yet implemented',
        message: 'This feature will be available in a future update'
    });
}));
exports.default = router;
//# sourceMappingURL=assessments.js.map