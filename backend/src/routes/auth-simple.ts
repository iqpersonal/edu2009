import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { loginSchema } from '../types/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../types/models';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Temporary demo user for testing
const DEMO_USER = {
  id: 'demo-user-1',
  email: 'admin@demo.com',
  password: '$2a$12$gEiwUGK/2I7ttd9TGT.sE.Uep8A1aP8qoqpohUrybRVfk.s8BvUKq', // password123
  firstName: 'Demo',
  lastName: 'Admin',
  role: UserRole.SUPER_ADMIN,
  schoolId: 'demo-school-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  // For demo purposes, use hardcoded user
  if (email.toLowerCase() !== DEMO_USER.email) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, DEMO_USER.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokenPayload = { 
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
    schoolId: DEMO_USER.schoolId
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

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
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: { 
      user: {
        id: req.user!.id,
        email: req.user!.email,
        firstName: 'Demo',
        lastName: 'Admin',
        role: req.user!.role,
        createdAt: new Date(),
        school: {
          id: req.user!.schoolId,
          name: 'Demo School'
        }
      }
    }
  });
}));

// Update password
router.put('/password', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;