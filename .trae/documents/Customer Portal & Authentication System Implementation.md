# Revised Implementation Plan: Customer Portal with Strict Separation

This plan implements a secure Customer Portal that is completely isolated from the Admin Dashboard. We will strictly separate "Users" (Admins) from "Customers" to prevent unauthorized access.

## 1. Strict Separation Strategy
We will maintain two distinct authentication identities:
*   **Admins (`Users`)**: Continue using the existing `public.users` table and `admin` role in `user_roles`. They access `/dashboard`.
*   **Customers**: Will use Supabase Auth (`auth.users`) linked exclusively to the `public.customers` table. They access `/portal`.

**Security Rules:**
1.  **No Cross-Login**: Admins cannot log in to the Customer Portal with their admin credentials (unless they also register as a customer).
2.  **Portal Guard**: The `/portal` routes will reject any user who does not have a valid Supabase Auth session.
3.  **Dashboard Guard**: The `/dashboard` routes remain protected for Admins only.

## 2. Database Enhancements
### **A. Schema Updates**
*   **Link Customers to Auth**: Add `auth_user_id` (UUID) to `public.customers` referencing `auth.users(id)`.
*   **Customer Trigger**: Create a trigger on `auth.users` that:
    *   On sign-up, checks if the email exists in `public.customers`.
    *   If yes, links the `auth_user_id` to that customer record.
    *   If no, creates a new customer record.
    *   **Crucially**: Does NOT create a record in `public.users` or `user_roles`.

### **B. Row Level Security (RLS)**
*   **`customers` Table**: `auth.uid() = auth_user_id`. (User can only read/edit their own profile).
*   **`bookings` Table**: `customerid` matches a customer record owned by `auth.uid()`.
*   **`travellers` Table**: Linked to the customer's account.

## 3. Customer Authentication Flow
*   **Login Page (`/portal/login`)**:
    *   Uses `supabase.auth.signInWithPassword()`.
    *   Redirects to `/portal` upon success.
*   **Registration (`/portal/signup`)**:
    *   Collects Name, Email, Password.
    *   Uses `supabase.auth.signUp()`.
    *   Triggers email verification (if enabled in Supabase).
*   **Password Reset**: Dedicated flow for customers.

## 4. Customer Dashboard (`/portal`)
A new, responsive layout separate from the Admin Dashboard.
*   **Navigation**: "My Trips", "Travelers", "Profile", "Logout".
*   **Responsive Design**: Mobile-first approach for travelers on the go.

### **Modules**
1.  **My Trips**:
    *   **Upcoming**: distinct visual style for future bookings.
    *   **History**: list of past bookings.
    *   **Details**: View itinerary, flight info, and total cost.
2.  **Travelers Management**:
    *   Add family members/companions (stores in `travellers` table).
    *   Select these travelers when (future) booking features are added.
3.  **Profile**:
    *   Manage contact info and passport details.
    *   Secure password update.

## 5. Technical & Security Implementation
*   **Middleware**: Update `middleware.ts` to handle `/portal` route protection separately from `/dashboard`.
*   **Validation**: Zod schemas for all customer inputs (registration, profile updates).
*   **HTTPS/CSRF**: Inherited from Next.js + Supabase security model.

## 6. Execution Steps
1.  **Database**: Execute SQL migration for `auth_user_id` and RLS policies.
2.  **Frontend Auth**: Build `/portal/login` and `/portal/signup`.
3.  **Layout**: Create the Customer Dashboard shell.
4.  **Features**: Implement Bookings, Travelers, and Profile pages.
5.  **Verify**: Test strict separation (Admin vs. Customer access).
