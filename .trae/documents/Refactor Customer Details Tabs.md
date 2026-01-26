I have proactively applied the following changes to `src/app/dashboard/customers/[id]/page.tsx` to meet your requirements:

1.  **Initialized State:** Changed the default `activeTab` from `"booking-history"` to `"profile"`.
2.  **Updated Tabs List:** Removed `"manage-booking"` and added `"profile"` to the navigation tabs.
3.  **Refactored Content:**
    *   Created a new `case "profile"` in the `renderTabContent` function.
    *   Moved the **Personal Information**, **Address Details**, and **Passport Details** sections (which were previously static at the bottom) into the new Profile tab.
    *   Removed the `case "manage-booking"` block entirely.
4.  **Cleaned Up Layout:** Removed the static rendering of the details sections from the main layout, ensuring they only appear when the "Profile" tab is active.

The Customer Details view now features a "Profile" tab as the default view, containing all the customer's personal details, and the "Manage Booking" tab has been removed.