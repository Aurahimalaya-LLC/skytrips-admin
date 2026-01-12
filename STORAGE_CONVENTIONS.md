# Media Storage Structure Convention

This document outlines the folder structure used for storing media files in Supabase Storage.

## 1. Top-Level Bucket
- **Bucket Name:** `media`
- **Access:** Public (Read), Authenticated (Write/Update/Delete)

## 2. Folder Hierarchy
Files are automatically organized by date at the time of upload.

**Pattern:** `YYYY/MM/filename`

- **YYYY:** 4-digit Year (e.g., "2024")
- **MM:** 2-digit Month (e.g., "01", "12")
- **filename:** Sanitized original name with timestamp and random suffix.

### Example Paths:
- `2024/02/1707765432100_a1b2c3.profile_pic.jpg`
- `2023/12/1701234567890_x9y8z7.document.pdf`

## 3. Naming Conventions
- **Filename:**
  - Original characters are sanitized: non-alphanumeric characters (except dots and hyphens) are replaced with `_`.
  - Prefix: Current timestamp (`Date.now()`) to ensure chronological sorting capability.
  - Suffix: 6-character random alphanumeric string to prevent collisions.
  - Extension: Preserved from original file.

## 4. Automated Handling
- **Creation:** Folders are implicitly created by Supabase Storage when a file is uploaded to a path. No explicit "create folder" API call is needed.
- **Deletion:** When the last file in a "folder" is deleted, Supabase automatically cleans up the virtual folder structure.

## 5. Error Handling
- **Collisions:** The random suffix and timestamp combination makes collisions statistically impossible.
- **Invalid Dates:** The system uses server-side (or client-side generation time) `Date` objects, ensuring valid YYYY/MM formats.
