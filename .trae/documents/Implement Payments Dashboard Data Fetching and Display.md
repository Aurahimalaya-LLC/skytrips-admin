## Implement Data Fetching and Display for Payments Dashboard

### 1. Update Type Definitions

* **Modify** **`src/types/payment.ts`**:

  * Update `SortField` type to include `customer_name`, `selling_price`, and `cost_price` to enable sorting for all requested columns.

### 2. Refactor `PaymentsTable.tsx` Component

* **Add Refresh Capability**:

  * Implement a manual refresh button in the controls header that triggers the `fetchPayments` function.

* **Dynamic Column Rendering**:

  * Conditionally render table headers and cells based on the `viewMode` ('customers' or 'agencies').

  * **For Customers**: Show columns for Booking ID, Traveller's Name, SP (Selling Price), and Payment Status.

  * **For Agency**: Show columns for Booking ID, Traveller's Name, CP (Cost Price), and Payment Status.

* **Standardize Traveller Name Logic**:

  * Create a helper to consistently extract the traveller's name from `travellers_json` or fallback to `customer_name`.

* **Formatting and Data Handling**:

  * Use `formatCurrency` for `selling_price` and `cost_price`.

  * Ensure `fetchPayments` correctly retrieves all necessary fields from `view_unified_payments`.

  * Implement sorting logic for the new columns.

### 3. UI/UX Enhancements

* **Responsive Design**: Ensure the table remains responsive on smaller screens by using appropriate Tailwind CSS classes.

* **Empty States**: Maintain and refine the empty state display when no transactions are found for the selected filters.

* **Loading/Error States**: Ensure consistent loading spinners and error messages are displayed during data fetching.

### 4. Verification

* Verify that clicking the "Refresh" button re-fetches data.

* Confirm that switching between tabs updates the columns as specified.

* Test sorting on all columns (Booking ID, Name, SP/CP, Status).

* Test the search and status filter functionality.

