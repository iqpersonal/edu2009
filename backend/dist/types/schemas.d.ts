import { z } from 'zod';
import { UserRole, AssessmentType, Term } from './models';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
    schoolId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    schoolId: string;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    schoolId: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}>;
export declare const createSchoolSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
}, {
    name: string;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
}>;
export declare const createStudentSchema: z.ZodObject<{
    studentId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    guardianName: z.ZodOptional<z.ZodString>;
    guardianPhone: z.ZodOptional<z.ZodString>;
    guardianEmail: z.ZodOptional<z.ZodString>;
    sectionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    studentId: string;
    dateOfBirth: string;
    sectionId: string;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    guardianName?: string | undefined;
    guardianPhone?: string | undefined;
    guardianEmail?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    studentId: string;
    dateOfBirth: string;
    sectionId: string;
    email?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    guardianName?: string | undefined;
    guardianPhone?: string | undefined;
    guardianEmail?: string | undefined;
}>;
export declare const createAssessmentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof AssessmentType>;
    maxScore: z.ZodNumber;
    passingScore: z.ZodOptional<z.ZodNumber>;
    term: z.ZodNativeEnum<typeof Term>;
    date: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    subjectId: z.ZodString;
    academicYearId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: AssessmentType;
    date: string;
    title: string;
    maxScore: number;
    term: Term;
    subjectId: string;
    academicYearId: string;
    description?: string | undefined;
    passingScore?: number | undefined;
    duration?: number | undefined;
}, {
    type: AssessmentType;
    date: string;
    title: string;
    maxScore: number;
    term: Term;
    subjectId: string;
    academicYearId: string;
    description?: string | undefined;
    passingScore?: number | undefined;
    duration?: number | undefined;
}>;
export declare const assessmentResultSchema: z.ZodObject<{
    score: z.ZodNumber;
    feedback: z.ZodOptional<z.ZodString>;
    submittedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    score: number;
    feedback?: string | undefined;
    submittedAt?: string | undefined;
}, {
    score: number;
    feedback?: string | undefined;
    submittedAt?: string | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type AssessmentResultInput = z.infer<typeof assessmentResultSchema>;
//# sourceMappingURL=schemas.d.ts.map