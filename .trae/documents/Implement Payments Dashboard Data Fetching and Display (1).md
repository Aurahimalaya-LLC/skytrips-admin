# Implement Data Fetching and Display for Payments Dashboard

## 1. Update Type Definitions
- **Modify [payment.ts](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/types/payment.ts)**:
    - Update `SortField` type to include `customer_name` and `cost_price`. (`selling_price` is already present).

## 2. Refactor PaymentsTable Component
- **Add Refresh Capability**:
    - Add a "Refresh" button in the controls header of [PaymentsTable.tsx](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/components/dashboard/payments/PaymentsTable.tsx) that triggers the `fetchPayments` function.
- **Implement Helper for Traveller Names**:
    - Create a `getTravellerDisplay` function to consistently extract names from `travellers_json` or fallback to `customer_name`.
- **Dynamic Column Rendering**:
    - Refactor the `<thead>` and `<tbody>` to render different columns based on `viewMode`:
        - **Customers View**: Booking ID, Traveller Name, SP (Selling Price), Status.
        - **Agencies View**: Booking ID, Traveller Name, CP (Cost Price), Status.
    - Ensure other columns (CP/Contact Person, Agency Name, Date, Method, Amount) are either removed or adjusted based on the new requirements.
- **Formatting and Sorting**:
    - Ensure `selling_price` and `cost_price` are formatted using `formatCurrency`.
    - Update `handleSort` and header click handlers to support the new sortable fields.

## 3. UI/UX Enhancements
- **Responsive Design**: Use Tailwind's hidden/visible classes (e.g., `md:table-cell`) to ensure the table looks good on mobile.
- **Loading/Error States**: Maintain existing loading spinners and error messages, ensuring they trigger correctly during manual refreshes.

## 4. Verification
- Verify the "Refresh" button functionality.
- Test tab switching between "Customers" and "Agencies" to ensure columns update dynamically.
- Confirm sorting on all columns (Booking ID, Name, SP/CP, Status).
- Test search and status filters.