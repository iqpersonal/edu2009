/**
 * School Creation Module
 * 
 * This module handles the creation of new schools and their admin users
 * in the School SaaS Platform.
 */

import { getSupabaseClient } from '../utils/supabaseClient.js';

/**
 * Create a new school and assign an admin user
 * @param {string} schoolName - The name of the school to create
 * @param {string} adminEmail - The email address of the school administrator
 * @returns {Promise<Object>} Success or failure message with details
 */
async function createNewSchool(schoolName, adminEmail) {
  try {
    // Validate input parameters
    if (!schoolName || typeof schoolName !== 'string' || schoolName.trim().length === 0) {
      throw new Error('School name is required and must be a non-empty string');
    }
    
    if (!adminEmail || typeof adminEmail !== 'string' || !isValidEmail(adminEmail)) {
      throw new Error('A valid admin email address is required');
    }
    
    // Get the Supabase client
    const supabase = getSupabaseClient();
    
    // Start a transaction-like operation by inserting school first
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert([
        {
          name: schoolName.trim(),
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select();
    
    if (schoolError) {
      throw new Error(`Failed to create school: ${schoolError.message}`);
    }
    
    if (!schoolData || schoolData.length === 0) {
      throw new Error('School was not created successfully');
    }
    
    const newSchool = schoolData[0];
    
    // Create the admin user and link to the school
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: adminEmail.toLowerCase().trim(),
          role: 'school_admin',
          school_id: newSchool.id,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select();
    
    if (userError) {
      // If user creation fails, we should ideally roll back the school creation
      // For now, we'll log the error and provide details about the partial success
      console.error('User creation failed after school creation:', userError);
      
      return {
        success: false,
        message: 'School was created but admin user creation failed',
        error: userError.message,
        schoolId: newSchool.id,
        schoolName: newSchool.name
      };
    }
    
    // Return success response
    return {
      success: true,
      message: 'School and admin user created successfully',
      data: {
        school: {
          id: newSchool.id,
          name: newSchool.name,
          createdAt: newSchool.created_at
        },
        admin: {
          id: userData[0].id,
          email: userData[0].email,
          role: userData[0].role
        }
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create school',
      error: error.message
    };
  }
}

/**
 * Simple email validation helper function
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { createNewSchool };