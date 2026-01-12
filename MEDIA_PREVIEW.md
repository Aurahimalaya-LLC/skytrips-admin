# Media Preview Functionality

This document details the improvements and architecture of the image preview system in the Media Management module.

## Overview

The preview functionality has been enhanced to support robust loading states, error handling, and consistent aspect ratio management across Grid, List, and Modal views.

## Key Components

### 1. `MediaThumbnail` (`src/components/media/MediaThumbnail.tsx`)
A unified component for rendering media previews.
- **Features**:
  - **Loading State**: Displays a spinner while the image is being fetched.
  - **Error Handling**: gracefully falls back to a "Broken Image" icon if the URL fails to load.
  - **File Type Support**: Renders appropriate Material Symbols icons for non-image types (Video, Audio, PDF).
  - **Aspect Ratio Control**: Supports `object-cover` (for thumbnails) and `object-contain` (for full previews) via the `objectFit` prop.
  - **Performance**: Uses Next.js `Image` component for automatic optimization.

### 2. `MediaList` (`src/components/media/MediaList.tsx`)
- Refactored to use `MediaThumbnail` for both Grid and List views.
- **State Management**: Switched from syncing state with `useEffect` to deriving state from the `files` array using `selectedFileId`. This prevents stale data issues when files are updated.

### 3. `MediaEditModal` (`src/components/media/MediaEditModal.tsx`)
- Updated to use `MediaThumbnail` for the preview section, ensuring consistent behavior with the main list.

## Usage

```tsx
// Grid View (Cover)
<MediaThumbnail file={file} objectFit="cover" />

// Modal View (Contain)
<MediaThumbnail file={file} objectFit="contain" />
```

## Testing

A manual verification page is available at:
`http://localhost:3000/dashboard/media/test`

This page demonstrates:
- Valid Image rendering
- Broken Image handling (fallback UI)
- Video/PDF icon rendering
- Grid vs Modal aspect ratios

## Troubleshooting

- **Broken Images**: If images fail to load, check the `MediaThumbnail` error state. It will show a "Failed to load" message.
- **Stale Previews**: If previews don't update after editing, ensure the `media-service.ts` is generating a new URL with a cache-busting timestamp (implemented in `updateFile`).
