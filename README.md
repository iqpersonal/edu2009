# School SaaS Platform (edu2009)

A comprehensive School-as-a-Service platform built with JavaScript and Supabase, featuring super admin management, school administration tools, and AI-powered academic analysis capabilities.

## Features

### Phase 1: Super Admin Module
- **Supabase Connection Utility**: Secure database client initialization with environment variable configuration
- **School Creation**: Complete school setup with admin user assignment

### Phase 2: School Admin Module
- **CSV Data Ingestion**: Robust CSV parsing and validation for student data import
- **Batch Student Management**: Efficient bulk student record insertion with conflict resolution

### Phase 3: AI-Powered Academic Analysis Core
- **Performance Analysis**: Comprehensive academic performance analysis including:
  - Subject-based average calculations
  - Trend analysis across assessment types
  - Statistical performance metrics
  - Data quality assessment

## Project Structure

```
src/
├── utils/
│   └── supabaseClient.js      # Database connection utility
├── admin/
│   └── createNewSchool.js     # School creation functionality
├── school/
│   ├── ingestUserData.js      # CSV data parsing and validation
│   └── batchInsertStudents.js # Bulk student record management
└── analysis/
    └── PerformanceAnalyzer.js # Academic performance analysis
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Usage

### Super Admin Operations

```javascript
import { getSupabaseClient, createNewSchool } from './index.js';

// Initialize Supabase client
const supabase = getSupabaseClient();

// Create a new school
const result = await createNewSchool('Lincoln High School', 'admin@lincoln.edu');
console.log(result);
```

### School Admin Operations

```javascript
import { ingestUserData, batchInsertStudents } from './index.js';

// Parse CSV student data
const csvResult = await ingestUserData(csvFile);

// Insert students into database
if (csvResult.success) {
  const insertResult = await batchInsertStudents(csvResult.data, schoolId);
  console.log(insertResult);
}
```

### Academic Analysis

```javascript
import { PerformanceAnalyzer } from './index.js';

const analyzer = new PerformanceAnalyzer();

// Analyze student performance
const assessmentData = [
  { subject: 'Math', score: 85, assessmentType: 'quiz', date: '2024-01-15' },
  { subject: 'Science', score: 92, assessmentType: 'test', date: '2024-01-20' },
  // ... more assessment records
];

const analysis = analyzer.analyzeStudent('student123', assessmentData);
console.log(analysis);
```

## Database Schema

The platform expects the following Supabase tables:

### Schools Table
```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

### Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  UNIQUE(student_id, school_id)
);
```

## Security Features

- Environment variable configuration for sensitive credentials
- Input validation and sanitization
- Robust error handling
- SQL injection prevention through Supabase client
- Row Level Security (RLS) support

## CSV Format for Student Import

Expected CSV headers:
- `student_id`: Unique identifier for the student
- `name`: Full name of the student
- `grade`: Grade level (K, 1-12)
- `parent_email`: Valid email address for parent/guardian

Example CSV:
```csv
student_id,name,grade,parent_email
S001,John Doe,9,parent@example.com
S002,Jane Smith,10,jane.parent@email.com
```

## Error Handling

All functions return structured response objects with:
- `success`: Boolean indicating operation success
- `message`: Human-readable status message
- `data`: Result data (on success)
- `error`: Error details (on failure)

## Development

The platform is built with modern JavaScript (ES6+) and uses:
- **Supabase**: Backend-as-a-Service for database operations
- **PapaParse**: CSV parsing library
- **ES6 Modules**: Modern module system

## License

MIT License