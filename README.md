# Fuel Tracer

A pure AMOLED dark-mode Progressive Web App (PWA) to track vehicle mileage between reserve hits.

## Setup Instructions

### 1. Google Sheets Backend
1. Create a new Google Sheet. Add these 5 tabs: `Users`, `Vehicles`, `Fuel_Log`, `Settings`, `Audit_Log`.
2. Add column headers exactly as shown in the script comments.
3. Add yourself to the `Users` sheet (e.g. Username: `admin`, Role: `Admin`, PasswordHash: `8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918` for "admin").
4. Add your bike to the `Vehicles` sheet.
5. Add `CURRENT_FUEL_PRICE` to the `Settings` sheet.
6. Go to **Extensions > Apps Script**, paste `Code.gs`, and Deploy as a Web App (Access: Anyone).

### 2. GitHub Pages Frontend
1. Copy the Web App URL from Google.
2. Open `index.html` and replace `"YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE"` on line 228.
3. Commit `index.html`, `manifest.json`, and `sw.js` to the `main` branch.
4. Go to Repo Settings > Pages, and deploy from the `main` branch root.
5. Open the GitHub pages URL on your phone and click "Add to Home Screen".
