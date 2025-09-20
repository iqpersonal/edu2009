/**
 * Batch Student Insert Module
 * 
 * This module handles the batch insertion of student records into Supabase,
 * with conflict resolution and proper error handling.
 */

import { getSupabaseClient } from '../utils/supabaseClient.js';

/**
 * Batch insert student records into Supabase with conflict resolution
 * @param {Array<Object>} studentRecords - Array of validated student records from CSV ingestion
 * @param {string} schoolId - The ID of the school these students belong to
 * @returns {Promise<Object>} Result of the batch insert operation
 */
async function batchInsertStudents(studentRecords, schoolId) {
  try {
    // Validate input parameters
    if (!Array.isArray(studentRecords) || studentRecords.length === 0) {
      throw new Error('Student records array is required and must not be empty');
    }
    
    if (!schoolId || typeof schoolId !== 'string') {
      throw new Error('School ID is required and must be a valid string');
    }
    
    // Get the Supabase client
    const supabase = getSupabaseClient();
    
    // Prepare records for insertion
    const recordsToInsert = studentRecords.map((record, index) => {
      // Validate each record has required fields
      if (!record.student_id || !record.name || !record.grade || !record.parent_email) {
        throw new Error(`Record at index ${index} is missing required fields`);
      }
      
      return {
        student_id: record.student_id,
        name: record.name,
        grade: record.grade,
        parent_email: record.parent_email,
        school_id: schoolId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        // Include any additional fields from the CSV
        ...Object.keys(record).reduce((acc, key) => {
          if (!['student_id', 'name', 'grade', 'parent_email'].includes(key)) {
            acc[key] = record[key];
          }
          return acc;
        }, {})
      };
    });
    
    // Use Supabase's upsert functionality to handle conflicts
    // This will insert new records and update existing ones based on student_id and school_id
    // 
    // Upsert Strategy:
    // - On conflict with student_id + school_id combination, update the existing record
    // - This prevents duplicate student entries within the same school
    // - Allows for data updates if the same student is re-imported with updated information
    const { data, error } = await supabase
      .from('students')
      .upsert(recordsToInsert, { 
        onConflict: 'student_id,school_id',
        ignoreDuplicates: false // This ensures updates happen on conflict
      })
      .select();
    
    if (error) {
      // Handle specific error types
      if (error.code === '23505') { // Unique constraint violation
        throw new Error(`Duplicate student records detected: ${error.message}`);
      } else if (error.code === '23503') { // Foreign key constraint violation
        throw new Error(`Invalid school ID or reference constraint violation: ${error.message}`);
      } else {
        throw new Error(`Database operation failed: ${error.message}`);
      }
    }
    
    // Process results
    const insertedCount = data ? data.length : 0;
    const skippedCount = recordsToInsert.length - insertedCount;
    
    return {
      success: true,
      message: 'Batch student insert completed successfully',
      summary: {
        totalRecords: recordsToInsert.length,
        insertedRecords: insertedCount,
        updatedRecords: skippedCount, // Records that were updated due to conflicts
        schoolId: schoolId
      },
      data: data
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Batch student insert failed',
      error: error.message,
      summary: {
        totalRecords: studentRecords ? studentRecords.length : 0,
        insertedRecords: 0,
        updatedRecords: 0,
        schoolId: schoolId
      }
    };
  }
}

/**
 * Alternative batch insert function that only inserts new records (no updates)
 * Use this when you want to strictly avoid updating existing student data
 * @param {Array<Object>} studentRecords - Array of validated student records
 * @param {string} schoolId - The ID of the school these students belong to
 * @returns {Promise<Object>} Result of the insert operation
 */
async function batchInsertNewStudentsOnly(studentRecords, schoolId) {
  try {
    // Input validation (same as above)
    if (!Array.isArray(studentRecords) || studentRecords.length === 0) {
      throw new Error('Student records array is required and must not be empty');
    }
    
    if (!schoolId || typeof schoolId !== 'string') {
      throw new Error('School ID is required and must be a valid string');
    }
    
    const supabase = getSupabaseClient();
    
    // Check for existing students to avoid conflicts
    const studentIds = studentRecords.map(record => record.student_id);
    const { data: existingStudents, error: checkError } = await supabase
      .from('students')
      .select('student_id')
      .eq('school_id', schoolId)
      .in('student_id', studentIds);
    
    if (checkError) {
      throw new Error(`Failed to check for existing students: ${checkError.message}`);
    }
    
    // Filter out existing students
    const existingStudentIds = new Set(existingStudents.map(s => s.student_id));
    const newStudents = studentRecords.filter(record => !existingStudentIds.has(record.student_id));
    
    if (newStudents.length === 0) {
      return {
        success: true,
        message: 'No new students to insert - all students already exist',
        summary: {
          totalRecords: studentRecords.length,
          insertedRecords: 0,
          skippedRecords: studentRecords.length,
          schoolId: schoolId
        }
      };
    }
    
    // Prepare new records for insertion
    const recordsToInsert = newStudents.map(record => ({
      student_id: record.student_id,
      name: record.name,
      grade: record.grade,
      parent_email: record.parent_email,
      school_id: schoolId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      // Include additional fields
      ...Object.keys(record).reduce((acc, key) => {
        if (!['student_id', 'name', 'grade', 'parent_email'].includes(key)) {
          acc[key] = record[key];
        }
        return acc;
      }, {})
    }));
    
    // Insert only new records
    const { data, error } = await supabase
      .from('students')
      .insert(recordsToInsert)
      .select();
    
    if (error) {
      throw new Error(`Insert operation failed: ${error.message}`);
    }
    
    return {
      success: true,
      message: 'New students inserted successfully',
      summary: {
        totalRecords: studentRecords.length,
        insertedRecords: data.length,
        skippedRecords: studentRecords.length - newStudents.length,
        schoolId: schoolId
      },
      data: data
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to insert new students',
      error: error.message,
      summary: {
        totalRecords: studentRecords ? studentRecords.length : 0,
        insertedRecords: 0,
        skippedRecords: 0,
        schoolId: schoolId
      }
    };
  }
}

export { batchInsertStudents, batchInsertNewStudentsOnly };