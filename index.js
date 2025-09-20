/**
 * School SaaS Platform - Main Module Exports
 * 
 * This file provides easy access to all the core functionality
 * of the School SaaS Platform.
 */

// Phase 1: Super Admin Module
export { getSupabaseClient } from './src/utils/supabaseClient.js';
export { createNewSchool } from './src/admin/createNewSchool.js';

// Phase 2: School Admin Module
export { ingestUserData } from './src/school/ingestUserData.js';
export { batchInsertStudents, batchInsertNewStudentsOnly } from './src/school/batchInsertStudents.js';

// Phase 3: AI-Powered Academic Analysis Core
export { PerformanceAnalyzer } from './src/analysis/PerformanceAnalyzer.js';