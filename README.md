# ⛽ Fuel Tracker

> **Enterprise-grade, zero-server, multi-user vehicle fuel tracking and fleet telemetry system.**
> Built on Google Sheets + Google Apps Script + a Progressive Web App (PWA) frontend with adaptive responsive layout matching a modern dark architecture.

---

## Table of Contents

1. [System Overview](https://www.google.com/search?q=%231-system-overview)
2. [Advanced Engineering Features](https://www.google.com/search?q=%232-advanced-engineering-features)
3. [Architecture Layer Diagram](https://www.google.com/search?q=%233-architecture-layer-diagram)
4. [File Structure](https://www.google.com/search?q=%234-file-structure)
5. [Feature Reference](https://www.google.com/search?q=%235-feature-reference)
6. [User Roles & Security Access](https://www.google.com/search?q=%236-user-roles--security-access)
7. [Google Sheet Structure](https://www.google.com/search?q=%237-google-sheet-structure)
8. [API Keys & Secrets Configuration](https://www.google.com/search?q=%238-api-keys--secrets-configuration)
9. [Setup & Deployment](https://www.google.com/search?q=%239-setup--deployment)
10. [Offline Sync Pipeline & Auto-Busting Cache Architecture](https://www.google.com/search?q=%2310-offline-sync-pipeline--auto-busting-cache-architecture)

---

## 1. System Overview

Fuel Tracker is an optimized **Progressive Web App (PWA)** that runs on top of cost-free Google cloud infrastructure. Tailored for individuals, groups, or businesses managing shared vehicles, it implements the mathematical **"Reserve-to-Reserve" tracking strategy** to provide exact efficiency diagnostics while removing guesswork from partial pump fuelings.

The application features an adaptive interface optimized for both mobile use and widescreen landscape views. It includes security systems to guard against brute-force attacks and synchronization engines to prevent data loss in cellular dead zones.

---

## 2. Advanced Engineering Features

* **True Mileage Mathematics:** Computes exact metrics strictly between two structural reserve tank occurrences, eliminating calculation discrepancies from irregular fuel fills.
* **Widescreen Landscape Fluid Engine:** Responsive layout grid parameters stretch automatically up to `1100px` on desktop and tablet screens, shifting elements into balanced visual columns.
* **Capco-Tier Security Lockdown:** Integrated `CacheService` engine actively tracks authentication failures, triggering an automatic 15-minute system lockout after 5 consecutive incorrect passwords.
* **Granular Offline Staging & iOS Fallbacks:** Offline inputs are captured as individual item arrays, protecting data during intermittent drops. Includes network listeners and iOS-compatible visibility triggers for background processing.
* **Isolated Multi-Vehicle Maintenance Lifecycle:** Maintenance markers (`Chain Lube` and `Engine Oil`) use unique vehicle namespaces inside the database, allowing you to track separate profiles without overlapping states.
* **Odometer Regression Blocks:** Server-side checks compare new logs against previous vehicle history, blocking invalid inputs or accidental typos.
* **Meta-Driven Cache Auto-Busting:** The service worker reads version metadata from `index.html` to automatically handle data eviction and asset caching on updates.

---

## 3. Architecture Layer Diagram

| Layer | Technology | Purpose & Mechanism |
| --- | --- | --- |
| **Frontend UI Shell** | HTML5 / CSS3 Grid & Flexbox / Vanilla JS | Adaptive viewport compilation; context-aware mobile numerical inputs. |
| **Data Visualization** | ApexCharts.js Framework | Real-time chart rendering with built-in empty-state safety safeguards. |
| **Offline Engine** | Service Worker Lifecycle & Local Cache | Asynchronous storage queues, page performance improvements, and visibility-polling fallback hooks. |
| **Backend Core** | Google Apps Script (`doPost(e)`) | Multi-user execution lock engine (`LockService`) and automated sliding window token checks. |
| **Database Tier** | Google Sheets Relational Tabs | High-speed, in-memory lookups via fast associative arrays. |

---

## 4. File Structure

```text
fuel-tracker/
├── index.html       # Single-file frontend UI, styles, responsive grid engines, and chart modules
├── manifest.json    # Progressive Web App installation schema configurations
├── sw.js            # Automated auto-busting cache manager and asset handler
└── Code.gs          # Server-side transactional locks, access throttles, and data logic

```

---

## 5. Feature Reference

### 5.1 Log Entry Interface

* **Contextual Form Factor:** Dropdowns match the available vehicle list. Switching selections updates your historical records, maintenance diagnostics, and charts instantly.
* **Touch-Optimized Layout:** Inputs use native mobile rules (`inputmode="numeric"`, `pattern="[0-9]*"`), hiding the standard alphabetical layout on touchscreens to prevent formatting issues.
* **Live Estimation Engine:** Typing a transaction price computes real-time volume estimates dynamically using current database values.

### 5.2 Multi-Vehicle Maintenance Trackers

* **Namespace Isolation:** Tracking parameters like `LAST_LUBE_ODO` and `LAST_OIL_ODO` append unique vehicle suffixes (e.g., `_V-001`), keeping data separated across multiple fleet profiles.
* **Dynamic Diagnostics:** Real-time progress indicators track component usage intervals (`Chain Lube` every 500 km, `Engine Oil` every 3,000 km). Colors shift dynamically from green to yellow, and then to a red alert stage once service targets are exceeded.

### 5.3 Advanced Live Dashboard Card Analytics

* **Live Top Metrics Strip:** The dashboard includes an overview analytics bar showing Total Spent (formatted in `₹`), Total Fuel Volume (L), Total Logs captured, and active Base Price variables.
* **Area Efficiency Timelines:** ApexCharts log efficiency trends over time, using safety checks to avoid dashboard errors on newly added vehicle profiles.
* **Aggregated Cost Distribution Metrics:** Bar graphs calculate expenditures by calendar month, while color-coded donut graphs plot total contribution percentages by user.

---

## 6. User Roles & Security Access

| Platform Capability | Admin Role | Standard User Role | Security Enforcement |
| --- | --- | --- | --- |
| **Log Fuel Transaction / Reserve Hit** | ✅ | ✅ | Validated against backend odometer checks. |
| **Update Global Price State** | ✅ | ✅ | Secured via concurrency script locks. |
| **Widescreen Dashboard Telemetry** | ✅ | ✅ | Generated directly from the spreadsheet history. |
| **Historical Correction Logs** | ✅ | ✅ | Tracks changes to the immutable audit database. |
| **Manage Users System Tab** | ✅ | ❌ | Hidden automatically on non-admin profiles. |

---

## 7. Google Sheet Structure

The core spreadsheet uses 5 required database sheets:

### 7.1 `Users`

* Headers: `Username` | `Role` | `PasswordHash` | `CreatedAt`
* Security Note: Passwords save as secure SHA-256 strings.

### 7.2 `Vehicles`

* Headers: `VehicleID` | `Name` | `Type` | `LicensePlate` | `AddedBy`

### 7.3 `Fuel_Log`

* Headers: `LogID` | `Date` | `Time` | `VehicleID` | `LogType` | `OdoReading` | `FuelAmount_INR` | `FuelLiters` | `PricePerLiter` | `LoggedBy` | `LastModified`

### 7.4 `Settings`

* Headers: `Key` | `Value` | `LastUpdated` | `UpdatedBy`
* Global Key: `CURRENT_FUEL_PRICE`
* Multi-Vehicle Sub-Keys: `LAST_LUBE_ODO_V-001`, `LAST_OIL_ODO_V-001`, etc.

### 7.5 `Audit_Log`

* Headers: `Timestamp` | `User` | `Action` | `TargetID` | `Details`

---

## 8. API Keys & Secrets Configuration

### Configuring the Hashing `APP_SECRET`

Secure passwords and session tokens are generated using a server-side salt property.

1. Inside the Google Apps Script editor, open the **⚙️ Project Settings** page.
2. Scroll to the **Script Properties** section and select **Add script property**.
3. Enter `APP_SECRET` as the property name.
4. Set its value to your preferred secure random string.

---

## 9. Setup & Deployment

1. Set up your Google Sheet structure with the exact columns specified above.
2. Open **Extensions → Apps Script** and paste the updated code block into `Code.gs`.
3. Click **Deploy → New Deployment** (Configuration: *Web App*, Execute as: *Me*, Access: *Anyone*).
4. Copy the deployment web URL and paste it into the `GOOGLE_API_URL` variable inside `index.html`.
5. Commit your updated `index.html`, `manifest.json`, and `sw.js` files to your GitHub Pages repository.
6. Launch the URL on a mobile screen and choose **Add to Home Screen** to complete the application setup.

---

## 10. Offline Sync Pipeline & Auto-Busting Cache Architecture

### 10.1 Fine-Grained Queue Architecture

If logs are submitted without cell reception, the app intercepts the connection drop and stages the transaction payload inside a local storage tracking array.

When connection drops are detected, a fine-grained synchronization process runs through queued entries sequentially. Only successfully confirmed logs are cleared from the storage array, protecting the remaining data if the sync is interrupted.

```text
[Dead Zone Input] ──> Fetch Fails ──> Staged as Item Array in LocalStorage Cache 
                                                                    │
[Online State / visibilitychange Trigger] ◄── Network Polling Restored 
                                                                    │
┌───────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┐
│  Granular Loop Evaluation Pipeline:                                                                                                  │
│  ├── Send Item #1 ──> Server Success 200 ──> Drop Item #1 safely from Local Cache Storage                                            │
│  └── Send Item #2 ──> Network Links Drop ──> Retain Item #2 & subsequent parameters in queue to protect records from bulk loss       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

### 10.2 Cache Expiration Controls

The app updates without manual intervention using a meta-driven asset processing script. When updates are pushed, the service worker reads version metadata directly from the page layout:

```html
<meta name="app-version" content="20260520">

```

