# VideoShare - Product Requirements Document (PRD)

## 1. Product Overview
VideoShare is a lightweight cloud-based video hosting and sharing platform. Users can upload their videos to a secure cloud space, automatically generate a QR code for each uploaded video, and easily share that QR code. Anyone who scans the QR code can access and view the video seamlessly on their device.

## 2. Core Features
- **Video Upload**: Users can select and upload video files from their device to the cloud.
- **QR Code Generation**: Upon successful upload, a unique QR code is instantly generated, linking to the video's playback page.
- **Video Playback**: A mobile-friendly playback page that opens when the QR code is scanned, allowing viewers to watch the video without downloading an app.
- **Video Management**: Users can view a list of their uploaded videos, re-download the QR codes, or delete videos.

## 3. User Interface Design (UI/UX)
- **Theme Preference**: Strictly **Light Mode**. Dark mode is explicitly disabled. The color palette will consist of white backgrounds, light gray borders, and subtle accents (Apple-style minimalism).
- **Layout**: Clean, single-column design optimized for mobile and desktop, utilizing soft shadows, rounded corners, and generous whitespace.
- **Skill**: Designed using UI-UX-Pro-Max principles for a polished, professional look.

## 4. User Flows
1. **Upload Flow**: 
   - User visits the homepage.
   - Clicks "Upload Video" -> Selects file -> Upload progress bar shown.
   - Success -> Displays the generated QR Code and a link.
2. **Scan & View Flow**:
   - Viewer scans the QR Code with their camera.
   - Browser opens the Video Playback page.
   - Video player loads and plays the video.

## 5. Non-Functional Requirements
- **Performance**: Fast upload times, optimized video streaming.
- **Accessibility**: High contrast text (in light mode), clear focus states, and aria-labels.
- **Responsive**: Fully responsive design (Tailwind CSS).
