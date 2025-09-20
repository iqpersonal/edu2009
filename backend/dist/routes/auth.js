"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const schemas_1 = require("../types/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(rateLimiter_1.authLimiter);
// Login
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = schemas_1.loginSchema.parse(req.body);
    const user = await index_1.prisma.user.findFirst({
        where: {
            email: email.toLowerCase(),
            isActive: true,
        },
        include: {
            school: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                }
            }
        }
    });
    if (!user || !user.school.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                school: user.school,
            }
        }
    });
}));
// Get current user profile
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await index_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
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
// Update password
router.put('/password', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const user = await index_1.prisma.user.findUnique({
        where: { id: req.user.id }
    });
    const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await index_1.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });
    res.json({
        success: true,
        message: 'Password updated successfully'
    });
}));
// Logout (client-side token removal)
router.post('/logout', auth_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map