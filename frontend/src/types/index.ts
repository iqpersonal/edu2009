export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  school: School;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    users: number;
    students: number;
  };
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  schoolId: string;
  sectionId: string;
  isActive: boolean;
  createdAt: string;
  section?: Section;
}

export interface Section {
  id: string;
  name: string;
  grade: string;
  capacity?: number;
  isActive: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: AssessmentType;
  maxScore: number;
  passingScore?: number;
  term: Term;
  date: string;
  duration?: number;
  isActive: boolean;
  subject: Subject;
  createdBy: User;
  _count?: {
    results: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
}

export interface AIRecommendation {
  id: string;
  type: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  student?: Student;
  createdBy: User;
}

export interface AnalyticsOverview {
  totalStudents: number;
  totalTeachers: number;
  totalAssessments: number;
  activeAcademicYears: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  ACADEMIC_DIRECTOR = 'ACADEMIC_DIRECTOR',
  HEAD_OF_SECTION = 'HEAD_OF_SECTION',
  SUBJECT_COORDINATOR = 'SUBJECT_COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export enum AssessmentType {
  QUIZ = 'QUIZ',
  TEST = 'TEST',
  EXAM = 'EXAM',
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT',
  HOMEWORK = 'HOMEWORK'
}

export enum Term {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  SUMMER = 'SUMMER'
}