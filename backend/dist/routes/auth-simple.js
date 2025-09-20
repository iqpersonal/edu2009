"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const schemas_1 = require("../types/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const models_1 = require("../types/models");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(rateLimiter_1.authLimiter);
// Temporary demo user for testing
const DEMO_USER = {
    id: 'demo-user-1',
    email: 'admin@demo.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQhxUpZBOxK6', // password123
    firstName: 'Demo',
    lastName: 'Admin',
    role: models_1.UserRole.SUPER_ADMIN,
    schoolId: 'demo-school-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
};
// Login
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = schemas_1.loginSchema.parse(req.body);
    // For demo purposes, use hardcoded user
    if (email.toLowerCase() !== DEMO_USER.email) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, DEMO_USER.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const tokenPayload = {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
        schoolId: DEMO_USER.schoolId
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({
        success: true,
        data: {
            token,
            user: {
                id: DEMO_USER.id,
                email: DEMO_USER.email,
                firstName: DEMO_USER.firstName,
                lastName: DEMO_USER.lastName,
                role: DEMO_USER.role,
                school: {
                    id: DEMO_USER.schoolId,
                    name: 'Demo School'
                }
            }
        }
    });
}));
// Get current user profile
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                email: req.user.email,
                firstName: 'Demo',
                lastName: 'Admin',
                role: req.user.role,
                createdAt: new Date(),
                school: {
                    id: req.user.schoolId,
                    name: 'Demo School'
                }
            }
        }
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
    // For demo, just return success
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
//# sourceMappingURL=auth-simple.js.map