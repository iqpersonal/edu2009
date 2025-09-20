/**
 * CSV Data Ingestion Module
 * 
 * This module handles the parsing and validation of CSV files containing
 * student data for the School SaaS Platform.
 */

import Papa from 'papaparse';

/**
 * Parse and validate CSV data for student records
 * @param {File|string} csvFile - CSV file object or CSV string content
 * @returns {Promise<Object>} Parsed and validated student records or error details
 */
async function ingestUserData(csvFile) {
  try {
    // Define expected CSV headers
    const expectedHeaders = ['student_id', 'name', 'grade', 'parent_email'];
    
    // Validate input
    if (!csvFile) {
      throw new Error('CSV file is required');
    }
    
    // Determine if input is a File object or string content
    let csvContent;
    
    if (csvFile instanceof File) {
      // Validate file type
      if (!csvFile.name.toLowerCase().endsWith('.csv') && csvFile.type !== 'text/csv') {
        throw new Error('Invalid file type. Please provide a CSV file.');
      }
      
      // Read file content
      csvContent = await readFileAsText(csvFile);
    } else if (typeof csvFile === 'string') {
      csvContent = csvFile;
    } else {
      throw new Error('CSV input must be a File object or string content');
    }
    
    // Parse CSV using PapaParse
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          try {
            // Validate parsing results
            if (results.errors && results.errors.length > 0) {
              const criticalErrors = results.errors.filter(error => error.type === 'Quotes');
              if (criticalErrors.length > 0) {
                throw new Error(`CSV parsing errors: ${criticalErrors.map(e => e.message).join(', ')}`);
              }
            }
            
            if (!results.data || results.data.length === 0) {
              throw new Error('CSV file appears to be empty or contains no valid data rows');
            }
            
            // Validate headers
            const actualHeaders = results.meta.fields || [];
            const missingHeaders = expectedHeaders.filter(header => 
              !actualHeaders.includes(header)
            );
            
            if (missingHeaders.length > 0) {
              throw new Error(`Missing required headers: ${missingHeaders.join(', ')}. Expected headers: ${expectedHeaders.join(', ')}`);
            }
            
            // Validate and transform data rows
            const validatedRecords = [];
            const validationErrors = [];
            
            results.data.forEach((row, index) => {
              try {
                const validatedRow = validateStudentRecord(row, index + 1);
                validatedRecords.push(validatedRow);
              } catch (error) {
                validationErrors.push(`Row ${index + 1}: ${error.message}`);
              }
            });
            
            // Return results
            const response = {
              success: true,
              data: validatedRecords,
              summary: {
                totalRows: results.data.length,
                validRows: validatedRecords.length,
                invalidRows: validationErrors.length,
                headers: actualHeaders
              }
            };
            
            // Include validation errors if any
            if (validationErrors.length > 0) {
              response.validationErrors = validationErrors;
              response.warning = `${validationErrors.length} rows had validation errors and were skipped`;
            }
            
            resolve(response);
            
          } catch (error) {
            reject({
              success: false,
              message: 'CSV validation failed',
              error: error.message
            });
          }
        },
        error: (error) => {
          reject({
            success: false,
            message: 'CSV parsing failed',
            error: error.message
          });
        }
      });
    });
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to process CSV file',
      error: error.message
    };
  }
}

/**
 * Validate individual student record
 * @param {Object} row - Raw CSV row data
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Object} Validated student record
 * @throws {Error} If validation fails
 */
function validateStudentRecord(row, rowNumber) {
  const errors = [];
  
  // Validate student_id
  if (!row.student_id || row.student_id.trim().length === 0) {
    errors.push('student_id is required');
  }
  
  // Validate name
  if (!row.name || row.name.trim().length === 0) {
    errors.push('name is required');
  }
  
  // Validate grade
  if (!row.grade || row.grade.trim().length === 0) {
    errors.push('grade is required');
  } else {
    const grade = row.grade.trim();
    // Basic grade validation (adjust based on your school's grade system)
    if (!/^(K|[1-9]|1[0-2])$/.test(grade)) {
      errors.push('grade must be K or 1-12');
    }
  }
  
  // Validate parent_email
  if (!row.parent_email || row.parent_email.trim().length === 0) {
    errors.push('parent_email is required');
  } else if (!isValidEmail(row.parent_email.trim())) {
    errors.push('parent_email must be a valid email address');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // Return cleaned and validated record
  return {
    student_id: row.student_id.trim(),
    name: row.name.trim(),
    grade: row.grade.trim(),
    parent_email: row.parent_email.trim().toLowerCase(),
    // Add any additional fields that might be in the CSV
    ...Object.keys(row).reduce((acc, key) => {
      if (!['student_id', 'name', 'grade', 'parent_email'].includes(key) && row[key]) {
        acc[key] = row[key].trim();
      }
      return acc;
    }, {})
  };
}

/**
 * Helper function to read File object as text
 * @param {File} file - File object to read
 * @returns {Promise<string>} File content as string
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
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

export { ingestUserData };