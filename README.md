# ⛽ Fuel Tracker

> **Zero-server, multi-user vehicle fuel tracking and mileage calculation system.**
> Built on Google Sheets + Google Apps Script + a PWA frontend. Pure AMOLED dark mode architecture.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Feature Reference](#4-feature-reference)
5. [User Roles](#5-user-roles)
6. [Google Sheet Structure](#6-google-sheet-structure)
7. [API Keys & Secrets — How to Configure](#7-api-keys--secrets--how-to-configure)
8. [Setup & Deployment](#8-setup--deployment)
9. [Offline Architecture](#9-offline-architecture)

---

## 1. System Overview

Fuel Tracker is a **Progressive Web App (PWA)** that runs on Google infrastructure. Designed for shared vehicles, it provides exact, mathematical mileage calculations using the "Reserve-to-Reserve" method.

- **True Mileage Mathematics:** Calculates efficiency only between reserve tank hits, removing the guesswork from partial fueling.
- **Presentation Dashboard:** Built-in ApexCharts generate interactive Area, Bar, and Donut charts tracking Mileage Trends, Monthly Spend, and User Cost Distribution.
- **Universal Price Editing:** Global fuel price can be updated dynamically by any user at the pump to ensure accurate liter estimation.
- **Multi-tier Role Access:** Secure login system separates Admin (who can manage users) from standard Users.
- **Audit Trails:** Edits, price changes, and user modifications are immutably logged to an Audit sheet.

---

## 2. Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML / CSS / Vanilla JS | Single-file PWA — no build step required, pure AMOLED black theme. |
| Charts | ApexCharts.js | Client-side visual rendering of dataset history. |
| Backend | Google Apps Script (doPost) | REST-like API with SHA-256 session token generation. |
| Database | Google Sheets (5 tabs) | Zero-cost persistent storage. |
| Secrets | Google Script Properties | `APP_SECRET` stored server-side, never exposed to the browser. |

---

## 3. File Structure

```text
fuel-tracker/
├── index.html       # Entire frontend — UI, styles, charts, and JS logic
├── manifest.json    # PWA manifest — handles home screen installation and icons
├── sw.js            # Service Worker — caching and offline fallback
└── Code.gs          # Google Apps Script backend — API actions and database logic
```

---

## 4. Feature Reference

### 4.1 Log Entry
- Select the active vehicle from a dropdown.
- Toggle between **⛽ Fueling** and **⚠️ Reserve Hit**.
- Enter Amount Paid; the system auto-calculates estimated liters based on the global pump price.
- Tap **Edit Price** to update the global price if the pump rate has changed.

### 4.2 History & Corrections
- Linear feed of all logs sorted chronologically.
- Highlights whether an entry was a Fueling or a Reserve event.
- Users can hit **Edit** to adjust Odo readings or Amount Paid if a typo was made. Changes are logged to the Audit sheet.

### 4.3 Presentation Dashboard
- **Live Mileage:** Automatically calculates the exact km/l based on fuel injected between the two most recent reserve hits.
- **Mileage Trend:** An Area Chart tracking efficiency over time.
- **Monthly Spend:** A Bar Chart aggregating all ₹ spent per calendar month.
- **Cost Distribution:** A Donut Chart calculating exactly how much each shared user has contributed to the vehicle.

### 4.4 Admin User Management
- Add, Edit, or Delete system users.
- Role management: toggle accounts between `Admin` and `User`.
- Secure Password resetting.

---

## 5. User Roles

| Role | Log Fuel | Edit Price | History View | Dashboard | Manage Users |
|---|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User** | ✅ | ✅ | ✅ | ✅ | — |

---

## 6. Google Sheet Structure

Your Google Sheet acts as the relational database. It requires exactly these 5 tabs:

1. **Users** — `Username` | `Role` | `PasswordHash` | `CreatedAt`
2. **Vehicles** — `VehicleID` | `Name` | `Type` | `LicensePlate` | `AddedBy`
3. **Fuel_Log** — `LogID` | `Date` | `Time` | `VehicleID` | `LogType` | `OdoReading` | `FuelAmount_INR` | `FuelLiters` | `PricePerLiter` | `LoggedBy` | `LastModified`
4. **Settings** — `Key` | `Value` | `LastUpdated` | `UpdatedBy` (Must contain `CURRENT_FUEL_PRICE` row)
5. **Audit_Log** — `Timestamp` | `User` | `Action` | `TargetID` | `Details`

---

## 7. API Keys & Secrets — How to Configure

### The `APP_SECRET`
This is the salt used for hashing passwords and generating secure session tokens.
1. In Apps Script editor → click **⚙️ Project Settings**
2. Scroll to **Script Properties** → **Add script property**
3. Property name: `APP_SECRET`
4. Value: *[Your secure random string]*

---

## 8. Setup & Deployment

1. Create the Google Sheet with the exact headers.
2. Go to **Extensions → Apps Script**, paste `Code.gs`.
3. Click **Deploy → New Deployment** (Web App, Execute as: Me, Access: Anyone).
4. Copy the Web App URL and paste it into `index.html`.
5. Host `index.html`, `manifest.json`, and `sw.js` on GitHub Pages.
6. Open the URL on a mobile device and "Add to Home Screen".

---

## 9. Offline Architecture

Fuel Tracker utilizes a Service Worker (`sw.js`) to cache the application shell. Once the app is loaded, the UI will remain accessible even in dead zones. 
*(Note: Active network connection is currently required to push new logs to the Google Sheet backend).*
```
