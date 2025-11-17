# Asset Repository Website

A full-stack web application for managing and organizing various types of assets including videos, audio files, links, and educational quizzes.

## Overview

The Asset Repository Website is a comprehensive platform that allows users to:
- Upload and store video files with playable video elements
- Embed video links from YouTube, Vimeo, and other platforms
- Upload and store audio files with built-in audio players
- Add and manage general links (PDFs, GitHub repos, websites, etc.)
- Upload and manage multiple-choice quizzes with JSON structure
- View and take interactive quizzes with scoring

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

The application follows a clean Domain-Driven Design (DDD) architecture:

1. **Domain Layer** (`shared/schema.ts`): TypeScript interfaces and types for Asset, Quiz, and related entities
2. **Application Layer** (`server/storage.ts`): IStorage interface with CRUD operations
3. **Infrastructure Layer** (`server/db.ts`, `server/objectStorage.ts`): Database and storage adapters
4. **Presentation Layer** (`client/src/`): React components and pages

## Key Features

### Asset Management
- **Video Files**: Upload video files to object storage with automatic playback
- **Video Links**: Embed YouTube/Vimeo videos with iframe rendering
- **Audio Files**: Upload audio files with native HTML5 audio player
- **General Links**: Add clickable links to any URL (PDFs, websites, repos)

### Quiz System
- **Upload**: JSON-based quiz upload with structure validation
- **Validation**: Automatic validation of quiz format
- **Viewer**: Interactive quiz-taking interface with:
  - Question navigation
  - Progress tracking
  - Score calculation
  - Detailed results with correct/incorrect answers

### Design System
- **Sidebar Navigation**: Fixed 240px width sidebar with clear navigation
- **Responsive Layout**: Desktop-first with tablet and mobile breakpoints
- **Component Library**: Consistent use of Shadcn components
- **Empty States**: Beautiful empty states for zero-data scenarios
- **Loading States**: Skeleton loaders for async content

## Database Schema

### Assets Table
```typescript
{
  id: varchar (UUID, primary key)
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
  title: text
  description: text
  json: jsonb (stores questions and answers)
  createdAt: timestamp
}
```

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

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset

### Quizzes
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz

### Object Storage
- `POST /api/objects/upload` - Get presigned upload URL
- `GET /objects/*` - Serve uploaded files

## Running the Project

The application runs automatically on Replit:

1. **Development**: The "Start application" workflow runs `npm run dev`
2. **Database**: PostgreSQL database is provisioned and connected
3. **Object Storage**: Object storage bucket is created and configured

## Recent Changes (November 17, 2025)

### Initial Implementation
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

1. Add asset search and filtering
2. Implement asset deletion functionality
3. Add quiz categories and tagging
4. Create quiz history and score tracking
5. Add bulk upload for multiple assets
6. Implement asset preview thumbnails
7. Add user authentication for protected uploads
