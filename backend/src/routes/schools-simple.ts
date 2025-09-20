import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all schools (Super Admin only)
router.get('/', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
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
router.get('/:id', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Feature not yet implemented' });
}));

router.post('/', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Feature not yet implemented' });
}));

router.put('/:id', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Feature not yet implemented' });
}));

router.delete('/:id', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Feature not yet implemented' });
}));

export default router;