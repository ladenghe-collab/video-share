# VideoShare - Technical Architecture Document

## 1. Tech Stack
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Strictly Light Mode configuration)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **QR Code Generation**: `qrcode.react` or similar lightweight library
- **Backend & Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for hosting video files)

## 2. System Architecture
- **Client-Side Rendering (CSR)**: The React app will handle all UI routing and state.
- **Supabase Integration**:
  - `supabase-js` client will be used for direct database inserts and storage uploads.
  - Row Level Security (RLS) will be configured to allow anonymous uploads (or authenticated if user system is added later). For this MVP, we will allow public read access for video playback and restricted write access based on user sessions (or anonymous sessions).

## 3. Database Schema
**Table: `videos`**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default `uuid_generate_v4()` | Unique identifier for the video |
| `title` | Text | Not Null | Original filename or user-provided title |
| `video_url` | Text | Not Null | Public URL of the video in Supabase Storage |
| `created_at` | Timestamptz | Default `now()` | Timestamp of upload |

## 4. Storage Bucket
**Bucket: `videos`**
- **Public**: Yes (Videos must be accessible via URL for playback)
- **Allowed MIME Types**: `video/*` (e.g., `video/mp4`, `video/quicktime`)

## 5. Security & RLS Policies
- **Table `videos`**:
  - `SELECT`: Public access (anon & authenticated).
  - `INSERT`: Allowed for anon/authenticated (depending on auth requirement).
- **Bucket `videos`**:
  - `SELECT`: Public access.
  - `INSERT`: Allowed for anon/authenticated.

## 6. Key Components
- `VideoUpload`: Component handling file selection, progress state, and Supabase upload API.
- `QRCodeDisplay`: Component rendering the generated URL into a scannable QR code.
- `VideoPlayer`: Responsive HTML5 video player component for the playback route.
