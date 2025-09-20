import { z } from 'zod';
import { UserRole, AssessmentType, Term } from './models';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  schoolId: z.string().min(1, 'School ID is required'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid website URL').optional(),
});

export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime('Invalid date format'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email format').optional(),
  sectionId: z.string().min(1, 'Section ID is required'),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(1, 'Assessment title is required'),
  description: z.string().optional(),
  type: z.nativeEnum(AssessmentType),
  maxScore: z.number().positive('Max score must be positive'),
  passingScore: z.number().positive('Passing score must be positive').optional(),
  term: z.nativeEnum(Term),
  date: z.string().datetime('Invalid date format'),
  duration: z.number().positive('Duration must be positive').optional(),
  subjectId: z.string().min(1, 'Subject ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
});

export const assessmentResultSchema = z.object({
  score: z.number().min(0, 'Score cannot be negative'),
  feedback: z.string().optional(),
  submittedAt: z.string().datetime('Invalid date format').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type AssessmentResultInput = z.infer<typeof assessmentResultSchema>;