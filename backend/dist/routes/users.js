"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
const schemas_1 = require("../types/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get users for current school or all schools (based on role)
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, search, role, schoolId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // Build where clause based on user role
    let where = {};
    if (req.user.role === client_1.UserRole.SUPER_ADMIN) {
        // Super admin can see users from all schools
        if (schoolId) {
            where.schoolId = schoolId;
        }
    }
    else {
        // Other roles can only see users from their own school
        where.schoolId = req.user.schoolId;
    }
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (role) {
        where.role = role;
    }
    const [users, total] = await Promise.all([
        index_1.prisma.user.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                school: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        index_1.prisma.user.count({ where })
    ]);
    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
// Get single user
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    let where = { id: req.params.id };
    // Non-super admins can only view users from their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        where.schoolId = req.user.schoolId;
    }
    const user = await index_1.prisma.user.findFirst({
        where,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            school: {
                select: {
                    id: true,
                    name: true,
                }
            },
            teacherSubjects: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                }
            }
        }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        success: true,
        data: { user }
    });
}));
// Create user
router.post('/', auth_1.requireSchoolAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas_1.createUserSchema.parse(req.body);
    // Non-super admins can only create users for their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        data.schoolId = req.user.schoolId;
    }
    // Check if school exists and is active
    const school = await index_1.prisma.school.findFirst({
        where: {
            id: data.schoolId,
            isActive: true
        }
    });
    if (!school) {
        return res.status(400).json({ error: 'Invalid or inactive school' });
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const user = await index_1.prisma.user.create({
        data: {
            ...data,
            email: data.email.toLowerCase(),
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            school: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
    res.status(201).json({
        success: true,
        data: { user }
    });
}));
// Update user
router.put('/:id', auth_1.requireSchoolAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas_1.updateUserSchema.parse(req.body);
    let where = { id: req.params.id };
    // Non-super admins can only update users from their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        where.schoolId = req.user.schoolId;
    }
    const updateData = { ...data };
    if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
    }
    const user = await index_1.prisma.user.update({
        where,
        data: updateData,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            updatedAt: true,
            school: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
    res.json({
        success: true,
        data: { user }
    });
}));
// Toggle user active status
router.patch('/:id/toggle-status', auth_1.requireSchoolAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    let where = { id: req.params.id };
    // Non-super admins can only update users from their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        where.schoolId = req.user.schoolId;
    }
    const user = await index_1.prisma.user.findFirst({
        where,
        select: { isActive: true }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await index_1.prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true,
            updatedAt: true,
        }
    });
    res.json({
        success: true,
        data: { user: updatedUser }
    });
}));
// Reset user password
router.patch('/:id/reset-password', auth_1.requireSchoolAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    let where = { id: req.params.id };
    // Non-super admins can only update users from their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        where.schoolId = req.user.schoolId;
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await index_1.prisma.user.update({
        where,
        data: { password: hashedPassword }
    });
    res.json({
        success: true,
        message: 'Password reset successfully'
    });
}));
// Delete user
router.delete('/:id', auth_1.requireSchoolAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    let where = { id: req.params.id };
    // Non-super admins can only delete users from their own school
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        where.schoolId = req.user.schoolId;
    }
    // Check if user has any assessments or recommendations
    const userDependencies = await index_1.prisma.user.findFirst({
        where,
        include: {
            _count: {
                select: {
                    assessments: true,
                    aiRecommendations: true,
                }
            }
        }
    });
    if (!userDependencies) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (userDependencies._count.assessments > 0 || userDependencies._count.aiRecommendations > 0) {
        return res.status(400).json({
            error: 'Cannot delete user with existing assessments or AI recommendations. Please transfer ownership first.'
        });
    }
    await index_1.prisma.user.delete({
        where: { id: req.params.id }
    });
    res.json({
        success: true,
        message: 'User deleted successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map