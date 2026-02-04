# Inquiry CRM Board - Implementation Details

## Overview
The Inquiry CRM Board is a comprehensive Kanban-based system designed to manage flight fare inquiries through their lifecycle. It features a modern, responsive interface with drag-and-drop capabilities, real-time filtering, and professional statistics tracking.

## Technical Architecture

### 1. Database Schema
- **Table**: `flight_inquiries`
- **Fields**: Supports inquiry ID, client details, route codes (IATA), travel dates, priority (High/Medium/Low), and lifecycle status.
- **Audit Logging**: A dedicated `flight_inquiry_audit_logs` table tracks every creation and status change, including old and new data states.
- **Row Level Security (RLS)**: Enabled to ensure only authenticated users can access and modify inquiry data.

### 2. API Layer
- **RESTful Endpoints**:
  - `GET /api/inquiries`: Supports complex filtering (search, status, priority, assignment).
  - `POST /api/inquiries`: Validates and creates new inquiry records.
  - `PATCH /api/inquiries/[id]`: Used for drag-and-drop status updates and detail modifications.
  - `DELETE /api/inquiries/[id]`: Secure deletion of records.

### 3. UI/UX Design
- **Kanban Interface**: 
  - Uses native HTML5 Drag and Drop API for a lightweight and dependency-free experience.
  - Color-coded columns (`New Inquiries`, `Processing`, `Quote Sent`, `Follow-up`) with item counters.
- **Card Design**: 
  - Professional typography hierarchy using `font-black` and `font-bold` for high scannability.
  - Priority badges with semantic color schemes (Red for High, Amber for Medium, Emerald for Low).
  - Route visualization using `material-symbols`.
- **Responsive Layout**: 
  - CSS Grid and Flexbox ensure a stable multi-column view on large screens.
  - The board container supports horizontal scrolling on smaller devices to maintain the Kanban structure.
- **Statistics Footer**: Real-time visualization of "Active Boards", "Queue Status", "Avg Response Time", and "Sales Velocity".

## Implementation Choices
- **Native DnD**: Chosen over third-party libraries to minimize bundle size and ensure compatibility with React 19.
- **Optimistic Updates**: The UI updates immediately upon dropping a card, with a rollback mechanism if the API call fails, providing a smooth user experience.
- **Tailwind CSS**: Used extensively for professional styling, including interactive hover states and rounded-3xl corners for a modern feel.

## Usage
Users can access the board via the **Inquiry CRM** link in the dashboard navigation. New inquiries can be added manually or eventually imported via PNR integration.
