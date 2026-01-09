I will create a comprehensive "Booking Management & Refund" workflow consisting of 4 dedicated pages that strictly follow the visual designs provided in the images.

### **Phase 1: Route Structure & Navigation Setup**
1.  **Modify `ManageBookingPage`**: Update the "Select Booking" radio button logic to redirect users to the start of the flow: `/dashboard/booking/[id]/manage`.
2.  **Create Directory Structure**:
    *   `/dashboard/booking/[id]/manage/page.tsx` (Image 1: Action Request)
    *   `/dashboard/booking/[id]/manage/refund/page.tsx` (Image 3: Financial Calculation)
    *   `/dashboard/booking/[id]/manage/verify/page.tsx` (Image 4: Verification)
    *   `/dashboard/booking/[id]/manage/status/page.tsx` (Image 2: Request Summary)

### **Phase 2: Component Implementation**
I will build reusable UI components to ensure consistency across the flow:
*   `FlightHeader`: The standardized flight details strip (ID, PNR, Route, etc.).
*   `FinancialCard`: For displaying pricing metrics (Selling Price, Cost, Margin).
*   `Timeline`: For the communication log in the status view.

### **Phase 3: Page Implementation Details**

#### **Step 1: Management Action Page (Image 1)**
*   **Location**: `/dashboard/booking/[id]/manage`
*   **Features**:
    *   Flight Details Header.
    *   **Action Form**: Read-only "Requested By" fields, "Reason" dropdown, "Notes" textarea.
    *   **Notification Section**: Checkboxes for Email/SMS, Template dropdown, Message preview.
    *   **Navigation**: "Confirm Action" button redirects to the Refund Calculation page.

#### **Step 2: Financial Breakdown Page (Image 3)**
*   **Location**: `/dashboard/booking/[id]/manage/refund`
*   **Features**:
    *   Financial Summary Cards (Selling, Cost, Margin).
    *   **Deductions Form**: Inputs for Airline Penalty, Agency Fees, Skytrips Fee with icons.
    *   **Calculation Engine**: Real-time updates for "Final Price Customer Gets" based on inputs.
    *   **Navigation**: "Confirm Refund" button redirects to the Verification page.

#### **Step 3: Transaction Verification Page (Image 4)**
*   **Location**: `/dashboard/booking/[id]/manage/verify`
*   **Features**:
    *   Success Banner ("Calculation Verified").
    *   **Read-Only Breakdown**: Static view of the calculations from the previous step.
    *   **Refund Summary**: Highlighted final amount and method.
    *   **Navigation**: "Complete" or "View Status" button redirects to the Status page.

#### **Step 4: Request Summary Page (Image 2)**
*   **Location**: `/dashboard/booking/[id]/manage/status`
*   **Features**:
    *   **Status Dashboard**: Badge showing "Waiting Response", Request Date, etc.
    *   **Communication Log**: Vertical timeline showing the history of events.
    *   **Flight Info**: Compact flight card.

### **Phase 4: Data & State Management**
*   Implement mock data fetchers to populate the booking details.
*   Use URL query parameters or client-side state to pass the "Refund Amount" and "Reason" between steps to ensure the flow feels real and connected.
*   Ensure all forms have validation (e.g., required reasons, non-negative numbers).

### **Phase 5: Styling & Responsiveness**
*   Use Tailwind CSS to match the exact spacing, colors (slate/gray text, primary blue buttons, green success states), and typography shown in the screenshots.
*   Ensure layouts stack correctly on mobile devices (e.g., side-by-side grids becoming vertical).
