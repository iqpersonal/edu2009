"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get AI recommendations for students
router.get('/recommendations', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, studentId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let where = {
        createdBy: {
            schoolId: req.user.schoolId
        },
        isActive: true
    };
    if (studentId) {
        where.studentId = studentId;
    }
    const [recommendations, total] = await Promise.all([
        index_1.prisma.aIRecommendation.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                type: true,
                title: true,
                content: true,
                priority: true,
                isRead: true,
                createdAt: true,
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        studentId: true,
                    }
                },
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        index_1.prisma.aIRecommendation.count({ where })
    ]);
    res.json({
        success: true,
        data: {
            recommendations,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
// Generate AI recommendations (placeholder)
router.post('/generate-recommendations', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({
        error: 'AI recommendation generation not yet implemented',
        message: 'This feature will be available in a future update with OpenAI integration'
    });
}));
// Mark recommendation as read
router.patch('/:id/mark-read', auth_1.requireTeacherRole, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const recommendation = await index_1.prisma.aIRecommendation.update({
        where: {
            id: req.params.id,
            createdBy: {
                schoolId: req.user.schoolId
            }
        },
        data: { isRead: true },
        select: {
            id: true,
            isRead: true,
            updatedAt: true,
        }
    });
    res.json({
        success: true,
        data: { recommendation }
    });
}));
exports.default = router;
//# sourceMappingURL=ai.js.map