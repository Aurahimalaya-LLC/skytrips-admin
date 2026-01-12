# Database Schema Documentation

## Media Table (`media`)

The `media` table stores metadata for all uploaded files.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `media_id` | `uuid` | No | Primary Key, default `gen_random_uuid()` |
| `title` | `varchar(255)` | Yes | Descriptive title of the file. Supports international characters. |
| `description` | `text` | Yes | Legacy description field. |
| `file_path` | `text` | No | Path in Storage bucket (e.g. `2024/02/filename.jpg`) |
| `mime_type` | `text` | No | MIME type of the file (e.g. `image/jpeg`) |
| `file_size` | `bigint` | No | Size in bytes |
| `width` | `integer` | Yes | Width in pixels (if image/video) |
| `height` | `integer` | Yes | Height in pixels (if image/video) |
| `duration` | `integer` | Yes | Duration in seconds (if video) |
| `alt_text` | `text` | Yes | Accessibility text for images. Supports international characters. |
| `caption` | `text` | Yes | Display caption or credits. Supports international characters. |
| `uploaded_by` | `uuid` | Yes | Foreign Key to `auth.users(id)` |
| `created_at` | `timestamptz` | No | Creation timestamp, default `now()` |
| `updated_at` | `timestamptz` | Yes | Last update timestamp |

### Indexes
- `idx_media_alt_text` on `alt_text` (B-Tree) - Optimizes simple text searches.
- `idx_media_title` on `title` (B-Tree) - Optimizes sorting and filtering by title.

### Relationships
- `media_tags`: Many-to-Many relationship with `tags` table.
- `media_categories`: Many-to-Many relationship with `categories` table.

## Media Tags Table (`media_tags`)
Junction table for media tags.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `media_id` | `uuid` | No | FK to `media(media_id)` |
| `tag_name` | `text` | No | Tag label |

## Media Categories Table (`media_categories`)
Junction table for media categories.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `media_id` | `uuid` | No | FK to `media(media_id)` |
| `category_name` | `text` | No | Category label |
