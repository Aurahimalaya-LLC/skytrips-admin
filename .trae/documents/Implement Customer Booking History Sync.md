I will implement the automated customer booking history synchronization and display feature.

### **1. New Component:** **`BookingHistory`**

Create `src/components/BookingHistory.tsx` to fetch and display booking history for a specific customer.

* **Props**: `email` (string)

* **Functionality**:

  * Fetches last 5 bookings from Supabase `bookings` table where `email` matches.

  * Displays a compact table: Date, Route (Origin → Dest), Status, and Price.

  * Handles "Loading" and "No history found" states.

### **2. Update** **`EditBookingPage`**

Modify `src/app/dashboard/booking/edit/[id]/page.tsx`:

* **State Management**: Add `selectedCustomerEmail` state to track the currently selected contact.

* **Integration**:

  * Import and render `<BookingHistory />` below the "Customer Contact Details" section.

  * Pass `selectedCustomerEmail` as a prop to trigger real-time updates.

### **3. Logic & Audit Trail**

Update the selection handlers (`handleCustomerSelect` and `handleTravelerSelect`):

* **Sync**: Update `selectedCustomerEmail` immediately when a contact is chosen.

* **Audit**: Implement a `logAssignmentChange` function to record the association event (e.g., "Contact Changed: \[Old Email] -> \[New Email]") to the console (serving as the immediate audit trail).

### **4. Verification**

* Verify that selecting a customer from the dropdown immediately populates the history section without a page refresh.

* Ensure the history data corresponds to the selected email.

