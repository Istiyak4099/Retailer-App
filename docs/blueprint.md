# **App Name**: Retailer EMI Assist

## Core Features:

- Retailer Authentication: Gmail authentication for retailer login, with an onboarding form to complete profile details: shop owner name, mobile number, email address, shop name, and shop address; persists data to the `Users` collection in Firestore.
- Customer Onboarding: Customer onboarding form for retailers to input customer details, including name, contact, phone model, IMEI and associated data, and a status; saves the data to the `Customers` collection in Firestore. retailer authentication (requires shop info).
- EMI Details Input: EMI details form for retailers to input EMI specifics (product, pricing, fees, installments, image uploads, and created timestamp); persists the data to the `EmiDetails` collection in Firestore, linking it to a customer record.
- Install Lock Module: Display the hardcoded 'Install Lock Module' QR code on its designated page; a permanent, non-unique QR code.
- Code Balance & QR Scan: A 'Code Balance' page to display available codes and trigger a Snackbar message when balance is insufficient, and manage state; integrates in-app QR scanning for available balance (with Firebase validation)

## Style Guidelines:

- Primary color: A calm blue (#64B5F6) to evoke trust and stability, suitable for enterprise use.
- Background color: Very light desaturated blue (#E3F2FD) to create a clean, professional backdrop.
- Accent color: A complementary orange (#FFB74D) for interactive elements and important notifications.
- Body and headline font: 'PT Sans', a humanist sans-serif to give a modern and subtly warm look.
- Clean, minimalist UI with responsive layouts to adapt to different screen sizes.
- Simple, clear icons to represent actions and status, enhancing usability.