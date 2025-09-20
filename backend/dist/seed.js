"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    // Create schools
    const demoSchool = await prisma.school.create({
        data: {
            name: 'Demo Elementary School',
            address: '123 Education St, Learning City, LC 12345',
            phone: '+1-555-0123',
            email: 'admin@demo-elementary.edu',
            website: 'https://demo-elementary.edu',
        }
    });
    const techSchool = await prisma.school.create({
        data: {
            name: 'Future Tech Academy',
            address: '456 Innovation Ave, Tech City, TC 67890',
            phone: '+1-555-0456',
            email: 'info@future-tech-academy.edu',
            website: 'https://future-tech-academy.edu',
        }
    });
    console.log('Created schools:', { demoSchool: demoSchool.name, techSchool: techSchool.name });
    // Create super admin
    const hashedPassword = await bcryptjs_1.default.hash('admin123456', 12);
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@edu2009.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: client_1.UserRole.SUPER_ADMIN,
            schoolId: demoSchool.id, // Super admin belongs to demo school for simplicity
        }
    });
    // Create school admin for demo school
    const schoolAdminPassword = await bcryptjs_1.default.hash('school123456', 12);
    const demoSchoolAdmin = await prisma.user.create({
        data: {
            email: 'admin@demo-elementary.edu',
            password: schoolAdminPassword,
            firstName: 'John',
            lastName: 'Administrator',
            role: client_1.UserRole.SCHOOL_ADMIN,
            schoolId: demoSchool.id,
        }
    });
    // Create academic director
    const academicDirectorPassword = await bcryptjs_1.default.hash('academic123456', 12);
    const academicDirector = await prisma.user.create({
        data: {
            email: 'academic@demo-elementary.edu',
            password: academicDirectorPassword,
            firstName: 'Sarah',
            lastName: 'Director',
            role: client_1.UserRole.ACADEMIC_DIRECTOR,
            schoolId: demoSchool.id,
        }
    });
    // Create teachers
    const teacherPassword = await bcryptjs_1.default.hash('teacher123456', 12);
    const mathTeacher = await prisma.user.create({
        data: {
            email: 'math.teacher@demo-elementary.edu',
            password: teacherPassword,
            firstName: 'Emma',
            lastName: 'Mathematics',
            role: client_1.UserRole.TEACHER,
            schoolId: demoSchool.id,
        }
    });
    const englishTeacher = await prisma.user.create({
        data: {
            email: 'english.teacher@demo-elementary.edu',
            password: teacherPassword,
            firstName: 'David',
            lastName: 'English',
            role: client_1.UserRole.TEACHER,
            schoolId: demoSchool.id,
        }
    });
    console.log('Created users:', {
        superAdmin: superAdmin.email,
        schoolAdmin: demoSchoolAdmin.email,
        academicDirector: academicDirector.email,
        mathTeacher: mathTeacher.email,
        englishTeacher: englishTeacher.email
    });
    // Create academic year
    const currentYear = new Date().getFullYear();
    const academicYear = await prisma.academicYear.create({
        data: {
            year: `${currentYear}-${currentYear + 1}`,
            startDate: new Date(`${currentYear}-09-01`),
            endDate: new Date(`${currentYear + 1}-06-30`),
            isCurrent: true,
            schoolId: demoSchool.id,
        }
    });
    // Create sections
    const grade5A = await prisma.section.create({
        data: {
            name: 'Grade 5A',
            grade: '5',
            capacity: 30,
            schoolId: demoSchool.id,
        }
    });
    const grade5B = await prisma.section.create({
        data: {
            name: 'Grade 5B',
            grade: '5',
            capacity: 30,
            schoolId: demoSchool.id,
        }
    });
    // Create subjects
    const mathSubject = await prisma.subject.create({
        data: {
            name: 'Mathematics',
            code: 'MATH5',
            description: 'Grade 5 Mathematics curriculum',
            credits: 4,
            schoolId: demoSchool.id,
            sectionId: grade5A.id,
            teachers: {
                connect: { id: mathTeacher.id }
            }
        }
    });
    const englishSubject = await prisma.subject.create({
        data: {
            name: 'English Language Arts',
            code: 'ELA5',
            description: 'Grade 5 English Language Arts curriculum',
            credits: 4,
            schoolId: demoSchool.id,
            sectionId: grade5A.id,
            teachers: {
                connect: { id: englishTeacher.id }
            }
        }
    });
    // Create sample students
    const students = [];
    for (let i = 1; i <= 10; i++) {
        const student = await prisma.student.create({
            data: {
                studentId: `STU${currentYear}${String(i).padStart(3, '0')}`,
                firstName: `Student${i}`,
                lastName: `LastName${i}`,
                dateOfBirth: new Date(`${currentYear - 10}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`),
                email: `student${i}@demo-elementary.edu`,
                guardianName: `Guardian ${i}`,
                guardianEmail: `guardian${i}@email.com`,
                guardianPhone: `+1-555-0${String(100 + i)}`,
                schoolId: demoSchool.id,
                sectionId: grade5A.id,
            }
        });
        students.push(student);
    }
    // Create sample assessments
    const mathQuiz = await prisma.assessment.create({
        data: {
            title: 'Fractions Quiz',
            description: 'Basic fractions understanding quiz',
            type: client_1.AssessmentType.QUIZ,
            maxScore: 100,
            passingScore: 70,
            term: client_1.Term.FIRST,
            date: new Date(),
            duration: 45,
            subjectId: mathSubject.id,
            createdById: mathTeacher.id,
            academicYearId: academicYear.id,
        }
    });
    const englishTest = await prisma.assessment.create({
        data: {
            title: 'Reading Comprehension Test',
            description: 'Test on reading comprehension skills',
            type: client_1.AssessmentType.TEST,
            maxScore: 100,
            passingScore: 75,
            term: client_1.Term.FIRST,
            date: new Date(),
            duration: 60,
            subjectId: englishSubject.id,
            createdById: englishTeacher.id,
            academicYearId: academicYear.id,
        }
    });
    // Create sample assessment results
    for (const student of students.slice(0, 5)) {
        // Math quiz results
        await prisma.assessmentResult.create({
            data: {
                score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
                feedback: 'Good understanding of fractions',
                submittedAt: new Date(),
                gradedAt: new Date(),
                studentId: student.id,
                assessmentId: mathQuiz.id,
            }
        });
        // English test results
        await prisma.assessmentResult.create({
            data: {
                score: Math.floor(Math.random() * 25) + 75, // Random score between 75-100
                feedback: 'Excellent reading comprehension skills',
                submittedAt: new Date(),
                gradedAt: new Date(),
                studentId: student.id,
                assessmentId: englishTest.id,
            }
        });
    }
    // Create sample AI recommendations
    await prisma.aIRecommendation.create({
        data: {
            type: 'academic',
            title: 'Math Support Needed',
            content: 'Student shows difficulty with fraction concepts. Recommend additional practice with visual aids.',
            priority: 'medium',
            studentId: students[0].id,
            createdById: mathTeacher.id,
        }
    });
    await prisma.aIRecommendation.create({
        data: {
            type: 'learning_style',
            title: 'Visual Learning Preference',
            content: 'Student demonstrates strong visual learning preferences. Consider incorporating more diagrams and visual materials.',
            priority: 'low',
            studentId: students[1].id,
            createdById: englishTeacher.id,
        }
    });
    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('Super Admin: superadmin@edu2009.com / admin123456');
    console.log('School Admin: admin@demo-elementary.edu / school123456');
    console.log('Academic Director: academic@demo-elementary.edu / academic123456');
    console.log('Math Teacher: math.teacher@demo-elementary.edu / teacher123456');
    console.log('English Teacher: english.teacher@demo-elementary.edu / teacher123456');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map