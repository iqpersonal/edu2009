"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get all schools (Super Admin only)
router.get('/', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        data: {
            schools: [
                {
                    id: 'demo-school-1',
                    name: 'Demo Elementary School',
                    address: '123 Education St, Learning City',
                    phone: '+1-555-0123',
                    email: 'admin@demo-elementary.edu',
                    isActive: true,
                    createdAt: new Date(),
                    _count: {
                        users: 5,
                        students: 25
                    }
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                pages: 1
            }
        }
    });
}));
// Placeholder routes
router.get('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({ error: 'Feature not yet implemented' });
}));
router.post('/', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({ error: 'Feature not yet implemented' });
}));
router.put('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({ error: 'Feature not yet implemented' });
}));
router.delete('/:id', auth_1.requireSuperAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(501).json({ error: 'Feature not yet implemented' });
}));
exports.default = router;
//# sourceMappingURL=schools-simple.js.map