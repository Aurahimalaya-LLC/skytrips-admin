## Global SMS Setup with touchSMS

I will configure a global SMS integration using the touchSMS API. This will involve setting up environment variables, creating a server-side utility for sending messages, and implementing an API route to handle SMS requests from the dashboard.

### 1. Environment Configuration
- Add the following variables to `.env.example` and `.env`:
  - `TOUCHSMS_TOKEN_ID`: Your touchSMS API Token ID (Username).
  - `TOUCHSMS_ACCESS_TOKEN`: Your touchSMS API Access Token (Password).
  - `TOUCHSMS_DEFAULT_SENDER`: Default Sender ID or Virtual Number (e.g., "SkyTrips").

### 2. SMS Utility Library
- Create `src/lib/sms.ts` to handle the core logic:
  - Construct the Basic Authentication header using `Token ID` and `Access Token`.
  - Implement a `sendSMS` function that calls `https://app.touchsms.com.au/api/v2/sms`.
  - Handle errors and log responses for debugging.

### 3. API Route Implementation
- Create `src/app/api/send-sms/route.ts`:
  - A secure POST endpoint to accept `to` (recipient number) and `message` (content).
  - Use the `sendSMS` utility to dispatch the message.
  - Return standardized JSON responses for success and failure.

### 4. Integration & Testing
- The setup will be ready for use in components like `ProcessingTab.tsx` or `FinancialSummaryTab.tsx`, similar to how `send-email` is currently implemented.

Would you like me to proceed with this implementation?