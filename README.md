Asset Repository Website
Overview
The Asset Repository Website is a full-stack web application designed for comprehensive management and organization of diverse digital assets, including videos, audio files, links, and educational quizzes. It enables users to structure content hierarchically within courses and sections, providing a robust platform for content delivery and interactive learning.

Key capabilities include:

Hierarchical content organization: Courses > Sections > Assets & Quizzes.
Upload and playback of video and audio files.
Embedding of external video links (YouTube, Vimeo).
Management of general links (PDFs, external websites).
Creation and interactive viewing of multiple-choice quizzes with scoring.
Intuitive navigation with an expandable sidebar.
The project aims to provide an efficient and user-friendly solution for educators and content creators to deliver structured course material.

User Preferences
Design Style: Clean, utility-focused dashboard with light gray sidebar
Typography: Open Sans for body text, Inter font family
Component Usage: Shadcn UI components throughout
Color Scheme: Blue for videos, green for audio, gray for links, purple for quizzes
System Architecture
The application employs a clean Domain-Driven Design (DDD) architecture centered around a course-based content hierarchy: Courses → Sections → Assets & Quizzes, with strict referential integrity enforced at the database level.

Technical Stack:

Frontend: React 18 with TypeScript, Wouter for routing, TanStack Query v5 for state management, Shadcn UI (Radix primitives), and Tailwind CSS for styling.
Backend: Node.js with Express.js.
Database: PostgreSQL (Neon) with Drizzle ORM.
Storage: Replit Object Storage (Google Cloud Storage) for media files.
Validation: Zod for schema validation.
Core Architectural Decisions & Design Patterns:

Hierarchical Content Structure: A fundamental design decision where all assets and quizzes must belong to a section, and all sections to a course, enforced via non-nullable foreign keys.
Modular Codebase: Organized into Domain, Application, Infrastructure, and Presentation layers for separation of concerns.
Comprehensive CRUD Operations: Full API support for managing courses, sections, assets, and quizzes.
Rich User Experience: Features like collapsible sidebar navigation, responsive layout, interactive quiz viewer, and robust empty/loading states.
Inline Editing and Creation: Streamlined workflows for modifying course/section details and creating new entities directly within the UI.
Cascade Deletion: Database-level cascade deletes ensure data integrity when courses or sections are removed.
Feature Specifications:

Course Organization: Hierarchical structure with dedicated course views and sidebar navigation.
Asset Management: Support for various asset types (video files, video links, audio files, general links) with integrated players/viewers.
Quiz System: JSON-based quiz upload with validation, interactive viewer, and scoring.
UI/UX Design: Utilizes Shadcn UI for consistent components, Tailwind CSS for styling, and thoughtful design for empty/loading states.
External Dependencies
Database: PostgreSQL (provided by Neon)
Object Storage: Replit Object Storage (built on Google Cloud Storage)
Frontend Libraries:
React
Wouter
TanStack Query
Shadcn UI (with Radix UI primitives)
Tailwind CSS
Zod (for validation)
Backend Libraries:
Express.js
Drizzle ORM
Zod (for validation)
