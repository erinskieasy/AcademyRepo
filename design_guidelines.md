# Asset Repository Website - Design Guidelines

## Design Approach
**System-Based Approach**: This is a utility-focused dashboard application prioritizing clarity, efficiency, and data organization. Drawing from Material Design and modern admin interface patterns (Linear, Notion, Stripe Dashboard) for clean, functional layouts.

## Layout System

**Core Structure**:
- Fixed left sidebar: 240px width, light gray background (#F7F8FA)
- Main content area: Flex-grow with max-width of 1400px, centered
- Consistent spacing units: Tailwind's 2, 4, 6, 8, 12, 16, 20, 24 units
- Page padding: px-8 py-6 for main content areas
- Section spacing: mb-8 between major content blocks

**Sidebar Navigation**:
- Logo/title at top with py-6 px-4 padding
- Navigation items with px-4 py-3 spacing
- Active state: subtle background (#E8EAED) with left border accent
- Icon + label horizontal layout with gap-3
- Sticky positioning for scroll persistence

## Typography

**Font Family**: 
- Primary: Inter or system font stack (-apple-system, BlinkMacSystemFont, "Segoe UI")
- Monospace for code/IDs: "Fira Code" or system monospace

**Hierarchy**:
- Page titles: text-2xl font-semibold (24px/600)
- Section headers: text-lg font-medium (18px/500)
- Card titles: text-base font-medium (16px/500)
- Body text: text-sm (14px/400)
- Metadata/labels: text-xs text-gray-600 (12px/400)
- Button text: text-sm font-medium (14px/500)

## Component Library

**Asset Cards**:
- White background with subtle border (border-gray-200)
- Rounded corners: rounded-lg
- Padding: p-4
- Hover state: subtle shadow (shadow-md)
- Card structure: Preview area (video/audio player or icon) + metadata section + action buttons
- Preview dimensions: aspect-video for videos, fixed height for audio players
- Metadata includes: filename, upload date, file size, asset type badge

**File Upload Area**:
- Dashed border (border-2 border-dashed border-gray-300)
- Generous padding: p-12 for drop zone
- Centered content with upload icon (48x48px)
- Instructions text: "Drag and drop or click to upload"
- Accepted formats listed below in small text
- Hover state: background tint and border color change
- Progress bar during upload: full-width at bottom with percentage

**Quiz Cards**:
- Similar card structure to assets
- Left section: quiz icon + title + description
- Right section: question count badge + view/delete actions
- Description truncated to 2 lines with ellipsis
- Created date in footer

**Data Tables** (for Dashboard list view):
- Header row: bg-gray-50 with sticky positioning
- Column headers: text-xs font-medium uppercase text-gray-700
- Row padding: py-3 px-4
- Row hover: bg-gray-50
- Alternating row backgrounds for longer lists
- Action column (right-aligned): icon buttons for view/delete

**Form Elements**:
- Input fields: border border-gray-300, rounded-md, px-3 py-2
- Focus state: ring-2 outline with primary color
- Labels: text-sm font-medium mb-1
- Helper text: text-xs text-gray-500 mt-1
- File inputs: Custom styled with hidden native input + button trigger
- Dropdowns: Matching input styling with chevron icon

**Buttons**:
- Primary: Solid fill, rounded-md, px-4 py-2
- Secondary: Border with transparent background
- Icon buttons: Square (32x32px) with centered icon
- Upload button: Prominent with upload icon
- Destructive actions: Red variant for delete operations

**Media Players**:
- Video player: Full-width with 16:9 aspect ratio, native controls
- Audio player: Full-width with waveform visualization or simple progress bar, custom controls (play/pause, progress, volume)
- Embedded videos (iframe): Responsive wrapper maintaining aspect ratio

**Status Badges**:
- Asset type indicators: rounded-full px-2.5 py-0.5, text-xs font-medium
- Different styling per type: Video (blue tint), Audio (green tint), Link (gray tint), Quiz (purple tint)

**Empty States**:
- Centered content with illustration or icon (96x96px)
- Primary text: "No assets uploaded yet"
- Secondary text: Brief instruction or encouragement
- Primary CTA button below text

**Quiz Viewer Interface**:
- Question card: Large text for question, spaced answer options
- Multiple choice options: Radio buttons with full-width clickable labels
- Option padding: p-3 with border, hover state
- Selected state: border accent with background tint
- Submit button: Bottom-right, prominent
- Results view: Correct answers highlighted in green, incorrect in red
- Score display: Large percentage at top

## Navigation & Routing

**Page Headers**:
- Breadcrumb trail: text-sm with separator icons
- Page title + action button(s) in flex row (space-between)
- Optional description text below title

**Transitions**:
- Minimal page transitions - simple fade
- Skeleton loaders for async content
- Toast notifications for upload success/errors (top-right positioning)

## Responsive Behavior

**Desktop-first** (primary use case):
- Sidebar always visible at 240px
- Content area scales with viewport
- Table columns: 4-6 visible on desktop

**Tablet** (md breakpoint):
- Sidebar collapses to icons only (64px) with tooltip on hover
- Reduce to 3-4 table columns
- Stack upload areas vertically

**Mobile** (base):
- Hamburger menu for sidebar (overlay)
- Single column layouts throughout
- Full-width cards and forms
- Bottom navigation bar for key actions

## Interaction Patterns

**File Upload Flow**:
1. Click or drag file to upload area
2. Immediate validation feedback
3. Progress indicator during upload
4. Success toast + auto-navigate to asset or refresh list
5. Error handling with retry option

**Asset Viewing**:
- Click card opens detailed view in modal or dedicated page
- In-place playback for video/audio
- Download option for all asset types
- Share URL functionality with copy-to-clipboard

**Quiz Taking**:
- Linear progression through questions
- Clear progress indicator (Question 3 of 10)
- Navigation between questions
- Review all answers before submission
- Results summary with option to retry

This utility-focused design prioritizes efficient workflows, clear information hierarchy, and straightforward interactions suitable for frequent use and file management tasks.