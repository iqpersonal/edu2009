"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacherRole = exports.requireAcademicRole = exports.requireSchoolAdmin = exports.requireSuperAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../types/models");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // For now, just use the decoded token data
        // TODO: Verify user exists and is active in database
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            schoolId: decoded.schoolId,
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: roles,
                current: req.user.role
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.requireRole)([models_1.UserRole.SUPER_ADMIN]);
exports.requireSchoolAdmin = (0, exports.requireRole)([models_1.UserRole.SUPER_ADMIN, models_1.UserRole.SCHOOL_ADMIN]);
exports.requireAcademicRole = (0, exports.requireRole)([
    models_1.UserRole.SUPER_ADMIN,
    models_1.UserRole.SCHOOL_ADMIN,
    models_1.UserRole.ACADEMIC_DIRECTOR,
    models_1.UserRole.HEAD_OF_SECTION
]);
exports.requireTeacherRole = (0, exports.requireRole)([
    models_1.UserRole.SUPER_ADMIN,
    models_1.UserRole.SCHOOL_ADMIN,
    models_1.UserRole.ACADEMIC_DIRECTOR,
    models_1.UserRole.HEAD_OF_SECTION,
    models_1.UserRole.SUBJECT_COORDINATOR,
    models_1.UserRole.TEACHER
]);
//# sourceMappingURL=auth.js.map