# Asset Repository Website

A full-stack web application for managing and organizing various types of assets including videos, audio files, links, and educational quizzes within a course-based hierarchy.

## Overview

The Asset Repository Website is a comprehensive platform that allows users to:
- **Organize content by courses and sections** - Hierarchical structure where courses contain multiple sections, and sections contain assets and quizzes
- Upload and store video files with playable video elements
- Embed video links from YouTube, Vimeo, and other platforms
- Upload and store audio files with built-in audio players
- Add and manage general links (PDFs, GitHub repos, websites, etc.)
- Upload and manage multiple-choice quizzes with JSON structure
- View and take interactive quizzes with scoring
- Browse courses with expandable sidebar navigation

## Project Structure

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query v5 for server state
- **UI Components**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS with custom design tokens

### Backend (Node.js + Express)
- **Server**: Express.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Storage**: Replit Object Storage (Google Cloud Storage) for media files
- **Validation**: Zod for schema validation

### Architecture

The application follows a clean Domain-Driven Design (DDD) architecture with a **course-based content hierarchy**:

**Content Hierarchy:**
- **Courses** → **Sections** → **Assets & Quizzes**
- Every asset and quiz must belong to a section
- Every section must belong to a course
- Enforced through non-nullable foreign keys at the database level

**Code Architecture:**
1. **Domain Layer** (`shared/schema.ts`): TypeScript interfaces and types for Course, Section, Asset, Quiz entities
2. **Application Layer** (`server/storage.ts`): IStorage interface with CRUD operations
3. **Infrastructure Layer** (`server/db.ts`, `server/objectStorage.ts`): Database and storage adapters
4. **Presentation Layer** (`client/src/`): React components and pages

## Key Features

### Course Organization
- **Hierarchical Structure**: Courses contain sections, sections contain assets and quizzes
- **Collapsible Sidebar**: Expandable "Courses" menu showing all courses
- **Course View**: Dedicated page for each course displaying all sections and their content
- **Navigation**: Click any course in sidebar to view its sections and assets

### Asset Management
- **Video Files**: Upload video files to object storage with automatic playback
- **Video Links**: Embed YouTube/Vimeo videos with iframe rendering
- **Audio Files**: Upload audio files with native HTML5 audio player
- **General Links**: Add clickable links to any URL (PDFs, websites, repos)
- **Section Assignment**: All assets must be assigned to a course section

### Quiz System
- **Upload**: JSON-based quiz upload with structure validation
- **Validation**: Automatic validation of quiz format
- **Section Assignment**: All quizzes must be assigned to a course section
- **Viewer**: Interactive quiz-taking interface with:
  - Question navigation
  - Progress tracking
  - Score calculation
  - Detailed results with correct/incorrect answers

### Design System
- **Sidebar Navigation**: Fixed 240px width sidebar with collapsible courses menu
- **Responsive Layout**: Desktop-first with tablet and mobile breakpoints
- **Component Library**: Consistent use of Shadcn components
- **Empty States**: Beautiful empty states for zero-data scenarios
- **Loading States**: Skeleton loaders for async content

## Database Schema

### Courses Table
```typescript
{
  id: varchar (UUID, primary key)
  title: text (required)
  description: text (required)
  createdAt: timestamp
}
```

### Sections Table
```typescript
{
  id: varchar (UUID, primary key)
  courseId: varchar (FK to courses.id, required, cascade delete)
  title: text (required)
  orderIndex: integer (default 0)
  createdAt: timestamp
}
```

### Assets Table
```typescript
{
  id: varchar (UUID, primary key)
  sectionId: varchar (FK to sections.id, required, cascade delete)
  type: text ('video_file' | 'video_link' | 'audio_file' | 'link')
  title: text
  url: text
  metadata: jsonb (stores file size, content type, etc.)
  createdAt: timestamp
}
```

### Quizzes Table
```typescript
{
  id: varchar (UUID, primary key)
  sectionId: varchar (FK to sections.id, required, cascade delete)
  title: text
  description: text
  json: jsonb (stores questions and answers)
  createdAt: timestamp
}
```

**Note**: All foreign keys are non-nullable, enforcing that every asset and quiz must belong to a section, and every section must belong to a course.

## Quiz JSON Format

Quizzes must follow this structure:

```json
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}
```

- **questions**: Array of question objects (minimum 1)
- **question**: The question text (required)
- **options**: Array of answer choices (minimum 2)
- **correctAnswer**: Index of correct option (0-based)

See `sample-quiz.json` for a complete example.

## Environment Variables

The application uses the following environment variables (automatically set by Replit):

- `DATABASE_URL`: PostgreSQL connection string
- `PRIVATE_OBJECT_DIR`: Directory for uploaded files in object storage
- `PUBLIC_OBJECT_SEARCH_PATHS`: Search paths for public assets
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`: Object storage bucket ID

## API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with sections, assets, and quizzes
- `POST /api/courses` - Create new course

### Sections
- `GET /api/sections?courseId=:courseId` - Get sections by course
- `POST /api/sections` - Create new section

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset (requires sectionId)

### Quizzes
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz (requires sectionId)

### Object Storage
- `POST /api/objects/upload` - Get presigned upload URL
- `GET /objects/*` - Serve uploaded files

## Running the Project

The application runs automatically on Replit:

1. **Development**: The "Start application" workflow runs `npm run dev`
2. **Database**: PostgreSQL database is provisioned and connected
3. **Object Storage**: Object storage bucket is created and configured

## Recent Changes (November 17, 2025)

### Inline Course/Section Creation & API Documentation (Latest)
**Added inline creation capabilities and comprehensive API documentation:**

**Inline Creation Features:**
- "Create New Course" option directly in course dropdown during upload
- "Create New Section" option directly in section dropdown during upload
- Modal dialogs for quick creation without leaving upload page
- Auto-select newly created courses and sections
- Works from empty state (users can create first course from dropdown)
- Immediate sidebar updates via cache invalidation

**API Documentation:**
- Complete API reference page in Settings
- All GET/POST endpoints documented with examples
- Expandable cards showing request/response formats
- Copy-paste ready fetch() code examples
- Covers: courses, sections, assets, quizzes, and object storage endpoints

**Components Updated:**
- CourseSectionSelector: Inline dialog forms with mutations
- Settings page: Redesigned as comprehensive API documentation
- Fixed blank state issue - dropdown always accessible

### Course-Based Architecture Restructuring
**Complete restructuring to hierarchical course organization:**

**Database Changes:**
- Created `courses` table (id, title, description, createdAt)
- Created `sections` table (id, courseId FK, title, orderIndex, createdAt)
- Added non-nullable `sectionId` foreign key to `assets` table
- Added non-nullable `sectionId` foreign key to `quizzes` table
- Enforced referential integrity with cascade deletes
- Migrated existing content to default "Getting Started" course

**Backend Implementation:**
- Full CRUD API for courses and sections
- Updated asset/quiz creation to require sectionId
- Added validation to reject creation without sectionId
- Implemented storage interface methods for course/section operations

**Frontend Updates:**
- Rebuilt sidebar with collapsible "Courses" menu
- Created course view page showing sections and their content
- Added CourseSectionSelector component for uploads
- Updated upload asset and upload quiz forms with course/section selection
- Integrated TanStack Query for course/section data fetching
- Added proper routing for /course/:id pages

**Validation:**
- Database-level enforcement via non-nullable foreign keys
- API-level validation via Zod schemas
- UI-level validation via form requirements
- Tested and verified: creation fails without sectionId, succeeds with valid sectionId

### Initial Implementation (Earlier)
- Set up complete database schema with assets and quizzes tables
- Implemented object storage integration for file uploads
- Created all frontend pages and components
- Built sidebar navigation with proper routing
- Added quiz upload with JSON validation
- Implemented quiz viewer with interactive question navigation
- Integrated TanStack Query for data fetching
- Added beautiful loading states and empty states
- Configured design system following design guidelines

## User Preferences

- **Design Style**: Clean, utility-focused dashboard with light gray sidebar
- **Typography**: Open Sans for body text, Inter font family
- **Component Usage**: Shadcn UI components throughout
- **Color Scheme**: Blue for videos, green for audio, gray for links, purple for quizzes

## Next Steps (Future Enhancements)

1. Add section reordering functionality (drag-and-drop)
2. Implement course/section/asset deletion UI
3. Add asset search and filtering within courses
4. Add quiz categories and tagging
5. Create quiz history and score tracking
6. Add bulk upload for multiple assets
7. Implement asset preview thumbnails
8. Add user authentication for protected uploads
9. Course duplication and templating
10. Section and asset moving between courses
11. Add copy-to-clipboard buttons for API documentation code examples
12. Implement API rate limiting and authentication (if making API public)
