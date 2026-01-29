## Implement .ics Calendar Attachment for E-Tickets

To enhance the customer experience, I will add an automatically generated iCalendar (.ics) file as an attachment when sending e-tickets. This allows customers to easily add their flight details to their personal calendars (Google Calendar, Apple Calendar, Outlook, etc.).

### Technical Implementation Plan:

**1. Update Email API to Support Multiple Attachments**
- Modify [route.ts](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/api/send-email/route.ts) to accept an `attachments` array.
- Update the logic to process both the legacy single `attachment` field and the new `attachments` array.
- Ensure all base64-encoded content is correctly converted to Buffers for the mail utility.

**2. Implement ICS Generation Logic**
- Add a helper function in [page.tsx](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/dashboard/booking/%5Bid%5D/eticket/page.tsx) to generate the `.ics` file content.
- This function will:
    - Iterate through the flight itineraries and segments.
    - Create a calendar event (`VEVENT`) for each flight segment.
    - Include details like Flight Number, Departure/Arrival times, Locations (IATA codes), and PNR in the description.
    - Handle date formatting according to the iCalendar standard (RFC 5545).

**3. Integrate with E-Ticket Email Flow**
- Update the `handleSendEmail` function in [page.tsx](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/dashboard/booking/%5Bid%5D/eticket/page.tsx).
- Generate the `.ics` string, convert it to base64, and include it in the `attachments` array sent to the API.
- The email will now contain two attachments:
    1. `Eticket-{PNR}.pdf` (The visual ticket)
    2. `Flight-Itinerary-{PNR}.ics` (The calendar event)

### Example .ics Event Structure:
```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SkyTrips//Flight Itinerary//EN
BEGIN:VEVENT
SUMMARY:Flight SQ123: LHR to SIN
DTSTART:20260210T143000Z
DTEND:20260210T184500Z
DESCRIPTION:Flight SQ123\nPNR: ABCDEF\nClass: Economy
LOCATION:London Heathrow Airport (LHR)
END:VEVENT
END:VCALENDAR
```

Does this approach meet your requirements? I can start the implementation once you confirm.