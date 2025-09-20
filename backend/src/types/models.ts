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

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  schoolId: string;
  sectionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}