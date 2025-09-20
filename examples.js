/**
 * School SaaS Platform - Usage Examples
 * 
 * This file demonstrates how to use all the components of the School SaaS Platform.
 * These examples show the typical workflow from school creation to student analysis.
 */

import { 
  getSupabaseClient, 
  createNewSchool, 
  ingestUserData, 
  batchInsertStudents,
  PerformanceAnalyzer 
} from './index.js';

/**
 * Example 1: Super Admin - Creating a new school
 */
async function exampleCreateSchool() {
  console.log('=== Example 1: Creating a New School ===');
  
  try {
    const result = await createNewSchool('Lincoln High School', 'admin@lincoln.edu');
    
    if (result.success) {
      console.log('✅ School created successfully!');
      console.log('School ID:', result.data.school.id);
      console.log('Admin Email:', result.data.admin.email);
      return result.data.school.id;
    } else {
      console.log('❌ School creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error in school creation example:', error);
    return null;
  }
}

/**
 * Example 2: School Admin - Ingesting student data from CSV
 */
async function exampleIngestStudentData() {
  console.log('\n=== Example 2: CSV Data Ingestion ===');
  
  // Sample CSV data as string (in real usage, this would be from a file)
  const sampleCSV = `student_id,name,grade,parent_email
S001,John Doe,9,john.parent@email.com
S002,Jane Smith,10,jane.parent@email.com
S003,Mike Johnson,9,mike.parent@email.com
S004,Sarah Wilson,11,sarah.parent@email.com`;

  try {
    const result = await ingestUserData(sampleCSV);
    
    if (result.success) {
      console.log('✅ CSV data ingested successfully!');
      console.log('Valid records:', result.summary.validRows);
      console.log('Invalid records:', result.summary.invalidRows);
      return result.data;
    } else {
      console.log('❌ CSV ingestion failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error in CSV ingestion example:', error);
    return null;
  }
}

/**
 * Example 3: School Admin - Batch inserting students
 */
async function exampleBatchInsertStudents(studentRecords, schoolId) {
  console.log('\n=== Example 3: Batch Student Insert ===');
  
  if (!studentRecords || !schoolId) {
    console.log('❌ Missing student records or school ID');
    return;
  }

  try {
    const result = await batchInsertStudents(studentRecords, schoolId);
    
    if (result.success) {
      console.log('✅ Students inserted successfully!');
      console.log('Total records processed:', result.summary.totalRecords);
      console.log('Records inserted:', result.summary.insertedRecords);
      console.log('Records updated:', result.summary.updatedRecords);
    } else {
      console.log('❌ Student insertion failed:', result.error);
    }
  } catch (error) {
    console.error('Error in batch insert example:', error);
  }
}

/**
 * Example 4: Academic Analysis - Analyzing student performance
 */
function examplePerformanceAnalysis() {
  console.log('\n=== Example 4: Academic Performance Analysis ===');
  
  // Sample assessment data for a student
  const assessmentData = [
    { subject: 'Mathematics', score: 85, assessmentType: 'quiz', date: '2024-01-15' },
    { subject: 'Mathematics', score: 92, assessmentType: 'test', date: '2024-01-22' },
    { subject: 'Science', score: 78, assessmentType: 'quiz', date: '2024-01-16' },
    { subject: 'Science', score: 88, assessmentType: 'test', date: '2024-01-23' },
    { subject: 'English', score: 91, assessmentType: 'quiz', date: '2024-01-17' },
    { subject: 'English', score: 87, assessmentType: 'test', date: '2024-01-24' },
    { subject: 'History', score: 82, assessmentType: 'quiz', date: '2024-01-18' },
    { subject: 'History', score: 89, assessmentType: 'test', date: '2024-01-25' }
  ];

  try {
    const analyzer = new PerformanceAnalyzer();
    const analysis = analyzer.analyzeStudent('S001', assessmentData);
    
    if (analysis.success === false) {
      console.log('❌ Analysis failed:', analysis.error);
      return;
    }

    console.log('✅ Performance analysis completed!');
    console.log('\n📊 Overall Statistics:');
    console.log(`   Average Score: ${analysis.overallStatistics.average}%`);
    console.log(`   Letter Grade: ${analysis.summary.overallGrade}`);
    console.log(`   Performance Level: ${analysis.summary.performanceLevel}`);
    
    console.log('\n📚 Subject Performance:');
    Object.entries(analysis.subjectAnalysis.averageScores).forEach(([subject, data]) => {
      console.log(`   ${subject}: ${data.average}% (${data.assessmentCount} assessments)`);
    });
    
    console.log('\n🎯 Best Subject:', analysis.subjectAnalysis.highestPerformingSubject.subject, 
                `(${analysis.subjectAnalysis.highestPerformingSubject.average}%)`);
    console.log('⚠️ Needs Attention:', analysis.subjectAnalysis.lowestPerformingSubject.subject, 
                `(${analysis.subjectAnalysis.lowestPerformingSubject.average}%)`);
    
    console.log('\n💡 Key Insights:');
    analysis.summary.insights.forEach(insight => {
      console.log(`   • ${insight}`);
    });
    
  } catch (error) {
    console.error('Error in performance analysis example:', error);
  }
}

/**
 * Run all examples in sequence
 */
async function runAllExamples() {
  console.log('🚀 School SaaS Platform - Complete Workflow Demo\n');
  
  // Example 1: Create a school
  const schoolId = await exampleCreateSchool();
  
  // Example 2: Ingest student data from CSV
  const studentRecords = await exampleIngestStudentData();
  
  // Example 3: Insert students (only if we have data and school ID)
  if (schoolId && studentRecords) {
    await exampleBatchInsertStudents(studentRecords, schoolId);
  }
  
  // Example 4: Analyze student performance (this works independently)
  examplePerformanceAnalysis();
  
  console.log('\n✨ Demo completed! Check the console output above for results.');
}

/**
 * Individual function examples
 */
export {
  exampleCreateSchool,
  exampleIngestStudentData,
  exampleBatchInsertStudents,
  examplePerformanceAnalysis,
  runAllExamples
};

// Uncomment the line below to run the demo when this file is executed directly
// runAllExamples();