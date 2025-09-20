"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get students for current school
router.get('/', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, search, sectionId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let where = { schoolId: req.user.schoolId };
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { studentId: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (sectionId) {
        where.sectionId = sectionId;
    }
    const [students, total] = await Promise.all([
        index_1.prisma.student.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                createdAt: true,
                section: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        index_1.prisma.student.count({ where })
    ]);
    res.json({
        success: true,
        data: {
            students,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
// Get single student
router.get('/:id', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const student = await index_1.prisma.student.findFirst({
        where: {
            id: req.params.id,
            schoolId: req.user.schoolId
        },
        include: {
            section: {
                select: {
                    id: true,
                    name: true,
                    grade: true,
                }
            },
            assessmentResults: {
                include: {
                    assessment: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            maxScore: true,
                            date: true,
                            term: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }
    res.json({
        success: true,
        data: { student }
    });
}));
// Create student (placeholder for now)
router.post('/', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        error: 'Student creation not yet implemented',
        message: 'This feature will be available in a future update'
    });
}));
exports.default = router;
//# sourceMappingURL=students.js.map