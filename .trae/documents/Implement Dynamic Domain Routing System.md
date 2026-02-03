# Implementation Plan: Domain Routing Management in Settings

This plan describes the implementation of a dynamic domain routing system integrated directly into the application's settings. It fulfills the requirement for geo-location based redirection while providing a management interface for administrators.

## 1. Domain Configuration Component
- **New Component**: Create `src/components/settings/DomainRoutingTab.tsx`.
  - **Features**:
    - **Toggle**: Enable/Disable dynamic domain routing globally.
    - **Regional Mapping**: Configuration inputs for specific regions:
      - Nepal -> `skytrips.com.np`
      - Australia -> `skytrips.com.au`
    - **Fallback Domain**: Configuration for the default international domain (`skytripsworld.com`).
  - **UI/UX**: Match the established design system (using Tailwind CSS and Material Symbols), similar to the existing `CurrencyTab` and `CompanyManager`.
  - **Validation**: Implement form validation to ensure entered domains are valid URL patterns.

## 2. Settings Page Integration
- **File**: `src/app/dashboard/settings/page.tsx`.
- **Changes**:
  - Add a new "Domain Routing" tab to the settings navigation bar.
  - Update the `settings` state to include a `domain_routing` configuration object.
  - Integrate the `DomainRoutingTab` component within the conditional rendering logic of the page.

## 3. Backend & API Support
- **File**: `src/app/api/settings/route.ts`.
- **Changes**:
  - Update the `GET` handler to retrieve `domain_routing` settings from the Supabase `settings` table.
  - Update the `POST` handler to persist the new domain routing configuration.
- **Data Structure**: Use a JSONB field `domain_routing` to store the mapping for flexibility.

## 4. Middleware Routing Logic
- **File**: `middleware.ts`.
- **Implementation**:
  - Detect the user's country via the `x-vercel-ip-country` header.
  - Fetch the domain routing configuration from the database.
  - Perform a **302 (Found)** redirect to the appropriate domain if the current host does not match the target host for the detected region.
  - **Exclusions**: Skip redirection for API routes, static assets, and specific authenticated paths to prevent loops.

## 5. Documentation & Testing
- **Documentation**: Create `DOMAIN_ROUTING.md` detailing the logic, configuration steps, and how to verify the routing.
- **Unit Testing**: Create `src/components/settings/__tests__/DomainRoutingTab.test.tsx` to verify the form behavior and validation logic.
- **Manual Verification**: Provide instructions for testing geo-routing using browser header emulation or proxy tools.

Does this integrated plan for the Domain Routing settings feature meet your expectations? I can begin implementation immediately upon your approval.