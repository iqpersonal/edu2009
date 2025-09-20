"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentResultSchema = exports.createAssessmentSchema = exports.createStudentSchema = exports.createSchoolSchema = exports.updateUserSchema = exports.createUserSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const models_1 = require("./models");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    role: zod_1.z.nativeEnum(models_1.UserRole),
    schoolId: zod_1.z.string().min(1, 'School ID is required'),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').optional(),
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    role: zod_1.z.nativeEnum(models_1.UserRole).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'School name is required'),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    website: zod_1.z.string().url('Invalid website URL').optional(),
});
exports.createStudentSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, 'Student ID is required'),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    dateOfBirth: zod_1.z.string().datetime('Invalid date format'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    guardianName: zod_1.z.string().optional(),
    guardianPhone: zod_1.z.string().optional(),
    guardianEmail: zod_1.z.string().email('Invalid email format').optional(),
    sectionId: zod_1.z.string().min(1, 'Section ID is required'),
});
exports.createAssessmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Assessment title is required'),
    description: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(models_1.AssessmentType),
    maxScore: zod_1.z.number().positive('Max score must be positive'),
    passingScore: zod_1.z.number().positive('Passing score must be positive').optional(),
    term: zod_1.z.nativeEnum(models_1.Term),
    date: zod_1.z.string().datetime('Invalid date format'),
    duration: zod_1.z.number().positive('Duration must be positive').optional(),
    subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
    academicYearId: zod_1.z.string().min(1, 'Academic year ID is required'),
});
exports.assessmentResultSchema = zod_1.z.object({
    score: zod_1.z.number().min(0, 'Score cannot be negative'),
    feedback: zod_1.z.string().optional(),
    submittedAt: zod_1.z.string().datetime('Invalid date format').optional(),
});
//# sourceMappingURL=schemas.js.map