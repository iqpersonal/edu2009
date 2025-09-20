"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const schemas_1 = require("../types/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get all schools (Super Admin only)
router.get('/', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    } : {};
    const [schools, total] = await Promise.all([
        index_1.prisma.school.findMany({
            where,
            skip,
            take: Number(limit),
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        students: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        index_1.prisma.school.count({ where })
    ]);
    res.json({
        success: true,
        data: {
            schools,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
}));
// Get single school
router.get('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const school = await index_1.prisma.school.findUnique({
        where: { id: req.params.id },
        include: {
            _count: {
                select: {
                    users: true,
                    students: true,
                    subjects: true,
                    academicYears: true,
                    sections: true,
                }
            }
        }
    });
    if (!school) {
        return res.status(404).json({ error: 'School not found' });
    }
    res.json({
        success: true,
        data: { school }
    });
}));
// Create school (Super Admin only)
router.post('/', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas_1.createSchoolSchema.parse(req.body);
    const school = await index_1.prisma.school.create({
        data,
        select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            isActive: true,
            createdAt: true,
        }
    });
    res.status(201).json({
        success: true,
        data: { school }
    });
}));
// Update school
router.put('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas_1.createSchoolSchema.partial().parse(req.body);
    const school = await index_1.prisma.school.update({
        where: { id: req.params.id },
        data,
        select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            isActive: true,
            updatedAt: true,
        }
    });
    res.json({
        success: true,
        data: { school }
    });
}));
// Toggle school active status
router.patch('/:id/toggle-status', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const school = await index_1.prisma.school.findUnique({
        where: { id: req.params.id },
        select: { isActive: true }
    });
    if (!school) {
        return res.status(404).json({ error: 'School not found' });
    }
    const updatedSchool = await index_1.prisma.school.update({
        where: { id: req.params.id },
        data: { isActive: !school.isActive },
        select: {
            id: true,
            name: true,
            isActive: true,
            updatedAt: true,
        }
    });
    res.json({
        success: true,
        data: { school: updatedSchool }
    });
}));
// Delete school (Super Admin only)
router.delete('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Check if school has any users or students
    const schoolData = await index_1.prisma.school.findUnique({
        where: { id: req.params.id },
        include: {
            _count: {
                select: {
                    users: true,
                    students: true,
                }
            }
        }
    });
    if (!schoolData) {
        return res.status(404).json({ error: 'School not found' });
    }
    if (schoolData._count.users > 0 || schoolData._count.students > 0) {
        return res.status(400).json({
            error: 'Cannot delete school with existing users or students. Please transfer or remove them first.'
        });
    }
    await index_1.prisma.school.delete({
        where: { id: req.params.id }
    });
    res.json({
        success: true,
        message: 'School deleted successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=schools.js.map