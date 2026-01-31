# Refactor Traveller Form and Enhance OCR Extraction

I will restructure the "New Traveller" form to separate personal and document details, and update the AI extraction to capture additional fields.

## 1. Backend OCR Enhancements
- **Update [route.ts](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/api/ocr/route.ts)**:
    - Expand the AI prompt to extract:
        - `place_of_birth`
        - `personal_no`
        - `date_of_issue`
    - Update the expected JSON schema to include these new keys.

## 2. Interface and State Updates
- **Update [page.tsx](file:///Users/krsna/Desktop/Ai_project/skytrips/New_Skytrips_adminpanel/src/app/dashboard/travellers/page.tsx)**:
    - Add `place_of_birth`, `personal_no`, and `date_of_issue` to the `Traveller` interface.
    - Update `handleImageUpload` to automatically populate these new fields when extracted by the AI.

## 3. UI Restructuring
- **Section 1: Personal Information**
    - Group: Title, Gender (Sex), First Name (Given Names), Last Name (Surname), Date of Birth, Nationality, and **Place of Birth**.
- **Section 2: Document Details**
    - Group: Passport Number, **Personal No.**, **Date of Issue**, and Passport Expiry.
- **Layout**: Use clear section headings and a grid layout to improve readability.

## 4. Verification
- Verify that the new fields are correctly extracted from images (using the sample text provided).
- Ensure the form correctly displays and saves all fields.

Does this structure for the form and the additional fields meet your requirements?