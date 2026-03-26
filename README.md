# ATMOS — Weather Dashboard

A responsive weather dashboard built with React + Vite, powered by the free [Open-Meteo API](https://open-meteo.com). No API key required.

---

## Features

- **Auto-detects location** via browser GPS on load
- **Page 1 – Current Weather:** View any single day (today or up to 2 years back) with stat cards and 6 hourly charts
- **Page 2 – Historical Analysis:** Select a date range (up to 2 years) for long-term trend charts (end date is yesterday, as we need full day data)
- **Temperature toggle:** Switch between °C and °F
- **All charts:** Zoom, pan, and horizontal scroll built in
- **Fully responsive:** Works on mobile and desktop

---

## Prerequisites

Make sure you have the following installed on your system:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| [Node.js](https://nodejs.org) | v18 or higher | `node -v` |
| npm | v9 or higher | `npm -v` |

> npm comes bundled with Node.js. No other tools needed.

---

## Installation

**1. Clone or extract the project**

If you have the zip file, extract it. Then open a terminal in the project folder:

```bash
cd weather-dashboard
```

**2. Install dependencies**

```bash
npm install
```

This installs all packages listed in `package.json` into a local `node_modules` folder.

---

## Running the App

**Development mode** (with hot reload):

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

When prompted, allow location access so the app can detect your position. If you deny it, it defaults to Dehradun, India.

---

## Building for Production

```bash
npm run build
```

This creates an optimized `dist/` folder. To preview it locally:

```bash
npm run preview
```

Then open **http://localhost:4173**

---

## Project Structure

```
weather-dashboard/
├── src/
│   ├── api/
│   │   └── weatherService.js     # All Open-Meteo API calls
│   ├── components/
│   │   ├── charts/
│   │   │   └── BaseChart.jsx     # Reusable ApexCharts wrapper
│   │   ├── layout/
│   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   └── ui/
│   │       ├── Skeleton.jsx      # Loading placeholders
│   │       └── StatCard.jsx      # Individual stat display card
│   ├── hooks/
│   │   ├── useGeolocation.js     # Browser GPS hook
│   │   ├── useLocationName.js    # Reverse geocoding hook
│   │   └── useWeather.js         # Date-aware weather data hook
│   ├── pages/
│   │   ├── Dashboard.jsx         # Page 1 – Current & single-day view
│   │   └── Historical.jsx        # Page 2 – Date range analysis
│   ├── utils/
│   │   └── formatters.js         # Temperature conversion, date helpers
│   ├── App.jsx                   # Router setup
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles and design tokens
├── .env                          # API base URLs (no secrets needed)
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## API Usage

This app uses three **free, no-key** Open-Meteo endpoints:

| Endpoint | Used For |
|----------|----------|
| `api.open-meteo.com/v1/forecast` | Today + last 92 days (hourly + daily) |
| `archive-api.open-meteo.com/v1/archive` | Dates older than 92 days (daily + hourly) |
| `air-quality-api.open-meteo.com/v1/air-quality` | PM10, PM2.5, AQI, CO, NO₂, SO₂, CO₂ |

No `.env` changes are needed — the app works out of the box.

---

## Troubleshooting

**Blank page / charts not loading**
- Make sure you ran `npm install` before `npm run dev`
- Check your internet connection (API calls go to open-meteo.com)

**Location showing Dehradun instead of your city**
- Your browser blocked location access — click the lock icon in the address bar and allow location, then refresh

**Port 5173 already in use**
- Run `npm run dev -- --port 3000` to use a different port

