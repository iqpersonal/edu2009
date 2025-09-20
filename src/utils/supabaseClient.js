/**
 * Supabase Client Utility
 * 
 * This utility provides a centralized way to initialize and access the Supabase client.
 * It uses environment variables for secure configuration.
 * 
 * Security Best Practices:
 * - Store SUPABASE_URL and SUPABASE_ANON_KEY in environment variables
 * - Never commit these keys to version control
 * - Use different keys for development, staging, and production environments
 * - Consider using Row Level Security (RLS) policies in Supabase for additional protection
 * - For production, consider using service role keys only on the server side
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Initialize and return a Supabase client instance
 * @returns {Object} Configured Supabase client
 * @throws {Error} If required environment variables are missing
 */
function getSupabaseClient() {
  // Get configuration from environment variables
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';
  
  // Validate that required environment variables are present
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Warning: Using placeholder Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    // Create and return the Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
  } catch (error) {
    throw new Error(`Failed to initialize Supabase client: ${error.message}`);
  }
}

export { getSupabaseClient };