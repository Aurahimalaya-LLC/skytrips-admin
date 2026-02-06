
# AgencySQDeduction Component

Displays the total deducted amount for 'SQ' (SQuAD) process for a specific agency.

## Features
- **Real-time Updates**: Listens to `agency_deductions` table changes via Supabase.
- **Formatting**: Currency formatted (AUD) with 2 decimal places and thousands separators.
- **Accessibility**: Includes `aria-label` and keyboard focus support (`tabIndex=0`).
- **Tooltip**: Shows "Deducted amount for SQ" on hover.

## Usage

```tsx
import AgencySQDeduction from "@/components/agency/AgencySQDeduction";

// ... inside your component
<AgencySQDeduction 
  agencyUid={selectedAgencyId} 
  className="text-lg" // Optional styling
/>
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `agencyUid` | `string | null | undefined` | The UUID of the agency to fetch deductions for. |
| `className` | `string` | Optional CSS classes for styling the container. |

## Data Source
Fetches from `agency_deductions` table where `category = 'SQ'`.
