-- School SaaS Platform Database Schema
-- This file contains the complete Supabase database schema for the School SaaS Platform

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'teacher', 'student', 'parent')),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  date_of_birth DATE,
  address TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  
  -- Ensure unique student_id per school
  UNIQUE(student_id, school_id)
);

-- Create assessments table for storing assessment records
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'homework', 'project', 'midterm', 'final', 'assignment')),
  assessment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_score DECIMAL(5,2) DEFAULT 100,
  weighted_score DECIMAL(5,2),
  notes TEXT,
  teacher_id UUID REFERENCES users(id),
  academic_year TEXT,
  semester TEXT
);

-- Create subjects table for standardizing subject names
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Create grades table for standardizing grade levels
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT UNIQUE NOT NULL,
  description TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  sort_order INTEGER
);

-- Insert default grade levels
INSERT INTO grades (level, description, sort_order) VALUES
('K', 'Kindergarten', 0),
('1', 'First Grade', 1),
('2', 'Second Grade', 2),
('3', 'Third Grade', 3),
('4', 'Fourth Grade', 4),
('5', 'Fifth Grade', 5),
('6', 'Sixth Grade', 6),
('7', 'Seventh Grade', 7),
('8', 'Eighth Grade', 8),
('9', 'Ninth Grade', 9),
('10', 'Tenth Grade', 10),
('11', 'Eleventh Grade', 11),
('12', 'Twelfth Grade', 12)
ON CONFLICT (level) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(assessment_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your authentication setup)
-- Policy for super admins to access all schools
CREATE POLICY "Super admins can access all schools" ON schools
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Policy for school admins to access their school
CREATE POLICY "School admins can access their school" ON schools
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'school_admin' AND 
        id::text = auth.jwt() ->> 'school_id'
    );

-- Policy for users to access users in their school
CREATE POLICY "Users can access users in their school" ON users
    FOR ALL USING (
        auth.jwt() ->> 'school_id' = school_id::text OR
        auth.jwt() ->> 'role' = 'super_admin'
    );

-- Policy for students access
CREATE POLICY "School members can access students in their school" ON students
    FOR ALL USING (
        auth.jwt() ->> 'school_id' = school_id::text OR
        auth.jwt() ->> 'role' = 'super_admin'
    );

-- Policy for assessments access
CREATE POLICY "School members can access assessments for their school students" ON assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = assessments.student_id 
            AND (students.school_id::text = auth.jwt() ->> 'school_id' OR auth.jwt() ->> 'role' = 'super_admin')
        )
    );

-- Policy for subjects
CREATE POLICY "School members can access subjects in their school" ON subjects
    FOR ALL USING (
        auth.jwt() ->> 'school_id' = school_id::text OR
        auth.jwt() ->> 'role' = 'super_admin' OR
        school_id IS NULL -- Global subjects
    );

-- Policy for grades (usually global)
CREATE POLICY "All authenticated users can access grades" ON grades
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create views for common queries
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    s.id,
    s.student_id,
    s.name,
    s.grade,
    s.school_id,
    COUNT(a.id) as total_assessments,
    ROUND(AVG(a.score), 2) as average_score,
    MIN(a.score) as lowest_score,
    MAX(a.score) as highest_score,
    COUNT(DISTINCT a.subject) as subjects_count
FROM students s
LEFT JOIN assessments a ON s.id = a.student_id
GROUP BY s.id, s.student_id, s.name, s.grade, s.school_id;

-- Create view for subject performance
CREATE OR REPLACE VIEW subject_performance_summary AS
SELECT 
    s.id as student_id,
    s.student_id,
    s.name as student_name,
    s.grade,
    s.school_id,
    a.subject,
    COUNT(a.id) as assessment_count,
    ROUND(AVG(a.score), 2) as average_score,
    MIN(a.score) as lowest_score,
    MAX(a.score) as highest_score,
    ROUND(STDDEV(a.score), 2) as score_std_dev
FROM students s
JOIN assessments a ON s.id = a.student_id
GROUP BY s.id, s.student_id, s.name, s.grade, s.school_id, a.subject;

-- Add comments for documentation
COMMENT ON TABLE schools IS 'Schools registered in the platform';
COMMENT ON TABLE users IS 'All users in the system including admins, teachers, students, and parents';
COMMENT ON TABLE students IS 'Student records linked to schools';
COMMENT ON TABLE assessments IS 'Individual assessment records for students';
COMMENT ON TABLE subjects IS 'Standardized subject names per school';
COMMENT ON TABLE grades IS 'Grade level definitions';

COMMENT ON COLUMN students.student_id IS 'School-specific student identifier';
COMMENT ON COLUMN assessments.score IS 'Score as percentage (0-100)';
COMMENT ON COLUMN assessments.weighted_score IS 'Score adjusted for assessment weight in final grade';

-- Sample data for testing (optional - remove in production)
/*
INSERT INTO schools (name, email) VALUES 
('Lincoln High School', 'admin@lincoln.edu'),
('Washington Elementary', 'admin@washington.edu');

INSERT INTO subjects (name, code) VALUES
('Mathematics', 'MATH'),
('Science', 'SCI'),
('English Language Arts', 'ELA'),
('Social Studies', 'SS'),
('Physical Education', 'PE'),
('Art', 'ART'),
('Music', 'MUS');
*/