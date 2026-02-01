# Implement Public Customer Profile Feature

This plan outlines the steps to make specific customer information, including booking history and linked travellers, publicly accessible through the user portal while maintaining strict data security.

## 1. Database Schema Enhancements
- Create a new migration to add the following fields to the `customers` table:
    - `public_profile_enabled` (boolean, default: `false`)
    - `company_name` (text, optional)
    - `public_bio` (text, optional)
- Update the `Customer` interface in [index.ts](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/types/index.ts) to include these new fields.

## 2. Secure API Endpoint Implementation
- Create a new API route: `src/app/api/portal/customers/[id]/public/route.ts`.
- **Logic**:
    1. Retrieve customer data by ID.
    2. Verify `public_profile_enabled` is set to `true`.
    3. **Data Sanitization**: Explicitly return only public-safe information:
        - **Profile**: `firstName`, `lastName`, `company_name`, `public_bio`, `profileImage`, `loyaltyTier`, `country`, `created_at`.
        - **Booking History**: A list of bookings containing only `origin`, `destination`, `travelDate`, `tripType`, and `status`. (Excludes PNR, prices, and sensitive IDs).
        - **Linked Travellers**: A list of travellers containing only `first_name`, `last_name`, and `title`. (Excludes email, phone, and passport data).
    4. **Performance**: Implement Next.js route caching (`revalidate = 3600`).
    5. **Security**: Ensure all sensitive data is filtered out server-side.

## 3. Frontend Implementation
### Profile Settings Update
- Enhance the existing [profile/page.tsx](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/portal/(dashboard)/profile/page.tsx):
    - Add a toggle switch for **"Public Profile Visibility"**.
    - Add inputs for **"Company Name"** and **"Public Bio"**.
    - Update the save logic to persist these settings.

### Public Profile Page
- Create a new public-facing page: `src/app/portal/customers/[id]/public/page.tsx`.
- Design a professional, responsive layout with sections for:
    - Profile Header (Avatar, Name, Company, Loyalty Status).
    - Public Bio.
    - **Travel Stats** (e.g., total public bookings).
    - **Recent Trips** (The sanitized booking history).
    - **Known Travellers** (The sanitized linked travellers list).
- Handle "Not Found" or "Private Profile" states gracefully.

## 4. Verification & Documentation
- **Testing**:
    - Verify that sensitive fields (PNR, passport numbers, emails) are never exposed via the public API.
    - Test the toggle functionality to ensure private profiles return a 404.
- **Documentation**:
    - Provide clear documentation of the public API structure and security measures.

Do you want me to proceed with this implementation?