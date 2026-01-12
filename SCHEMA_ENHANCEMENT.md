# Customer Schema Enhancement Documentation

## Overview
This update enhances the `customers` table to support a richer user profile including loyalty program details, user preferences, and marketing consent tracking.

## New Fields

| Field Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `preferences` | `JSONB` | `{}` | Stores flexible user settings (e.g., notification preferences). |
| `loyalty_tier` | `VARCHAR(50)` | `Blue` | Current status in loyalty program (Blue, Silver, Gold, Platinum). |
| `loyalty_points` | `INTEGER` | `0` | Accumulated reward points. Must be non-negative. |
| `source` | `VARCHAR(50)` | `web` | Origin of the customer record (web, mobile, import). |
| `preferred_language` | `VARCHAR(10)` | `en` | ISO language code for communications. |
| `preferred_currency` | `VARCHAR(3)` | `USD` | ISO currency code for pricing display. |
| `marketing_consent` | `BOOLEAN` | `false` | GDPR/CCPA compliance flag for marketing. |

## Data Transformation Logic

### Name Normalization
- First and Last names are automatically title-cased.
- Example: "JOHN DOE" -> "John Doe"

### Date Handling
- Supports standard ISO strings (`YYYY-MM-DD`).
- **Excel Serial Dates**: Automatically converts numeric dates (e.g., `33763` -> `1992-06-12`).

### Phone Number
- Non-numeric characters are stripped.
- Country code is preserved or defaults to `+1` if not provided.

### Boolean Fields
- Text values "true"/"false" (case-insensitive) are converted to booleans.

## Migration
Run the SQL script located at `scripts/enhance_customers_schema.sql` to apply these changes to your Supabase database.

```sql
-- Example migration command via Supabase CLI
supabase db reset
-- OR execute the SQL in the Supabase Dashboard SQL Editor
```

## API Updates
The import API (`/api/customers/import`) now accepts and validates these new fields.
