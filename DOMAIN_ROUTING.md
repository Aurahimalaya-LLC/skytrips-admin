# Dynamic Domain Routing Documentation

The Skytrips application features a dynamic domain routing system that automatically directs users to the most appropriate regional domain based on their geographical location. This system improves local SEO and provides a tailored user experience for specific markets.

## Configuration

The system can be configured directly from the **Admin Dashboard**:
1. Navigate to **Settings**.
2. Select the **Domain Routing** tab.

### Settings Fields

- **Enable Dynamic Geo-Routing**: A global toggle to turn the redirection system on or off.
- **Default Fallback Domain**: The domain used when a user's country is not explicitly mapped or when geo-location detection fails (e.g., `skytripsworld.com`).
- **Regional Mappings**: A list of specific region-to-domain rules. Each mapping consists of:
  - **Region Name**: A descriptive name for the mapping (e.g., "Nepal").
  - **Country Code (ISO)**: The 2-letter ISO country code (e.g., `NP` for Nepal, `AU` for Australia).
  - **Target Domain**: The full domain name for that region (e.g., `skytrips.com.np`).

## Technical Implementation

### Middleware Detection
The system uses Next.js Middleware running on the Edge. It identifies the user's origin country by checking the `x-vercel-ip-country` header, which is provided by the Vercel infrastructure.

### Redirection Logic
1. The middleware fetches the latest routing configuration from the Supabase `settings` table.
2. It identifies the target domain based on the detected country code.
3. If the current host does not match the target domain, a **302 (Found)** redirect is performed.
4. Redirection is skipped for:
   - API routes (`/api/*`)
   - Static assets (`/_next/*`, `public/*`)
   - Local development (`localhost`)

### Session Management
Since cookies are domain-specific, users moving between domains (e.g., from `skytripsworld.com` to `skytrips.com.np`) may need to re-authenticate unless a cross-domain SSO mechanism is implemented.

## Testing

To verify the routing logic without changing your physical location:
1. Use a tool like `curl` to send requests with a custom country header:
   ```bash
   curl -I -H "x-vercel-ip-country: NP" https://skytripsworld.com
   ```
2. Check for a `location` header in the response pointing to `skytrips.com.np`.

## Troubleshooting

- **Redirection Loop**: Ensure the target domain is not redirecting back to the original domain.
- **Failed Detection**: If the country header is missing, the system will default to the fallback domain.
- **SSL Errors**: Ensure all configured domains have valid SSL certificates installed on the hosting platform.
