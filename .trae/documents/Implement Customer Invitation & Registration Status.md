I will implement a "Send Signup Link" feature in the admin panel to invite customers who haven't registered yet.

### 1. Update Data Types
- **File:** `src/types/index.ts`
- **Action:** Add `auth_user_id` to the `Customer` interface to track registration status.

### 2. Implement Email Logic
- **File:** `src/lib/mail.ts`
- **Action:** Add a `sendCustomerInvite` function that sends a branded email containing a direct link to the signup page (`/portal/auth/signup?email=...`).

### 3. Create API Endpoint
- **File:** `src/app/api/customers/invite/route.ts`
- **Action:** Create a new API route that accepts customer details and triggers the invitation email using the new mail function.

### 4. Update Customer Details UI
- **File:** `src/app/dashboard/customers/[id]/page.tsx`
- **Action:**
    - Display "Registered" or "Not Registered" status based on `auth_user_id`.
    - Add a "Send Signup Link" button for unregistered customers.
    - Connect the button to the new API endpoint to send the invite.