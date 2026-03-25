# ⛈ ATMOS — Weather Dashboard

A responsive weather intelligence dashboard built with React + Vite, powered by the Open-Meteo API.

## Features

### Page 1 — Current Weather & Hourly Forecast
- Auto-detects user location via browser GPS on load
- Date picker to view any date (today + 6-day forecast)
- **Individual stat cards** for:
  - Temperature: Current, Max, Min
  - Atmospheric: Precipitation, Humidity, UV Index, Wind Speed Max, Precipitation Probability Max
  - Sun Cycle: Sunrise & Sunset (IST)
  - Air Quality: AQI, PM10, PM2.5, CO, NO₂, SO₂
- **6 Hourly Charts** (zoom + horizontal scroll + mobile-friendly):
  - Temperature (°C / °F toggle)
  - Relative Humidity
  - Precipitation (bar chart)
  - Visibility
  - Wind Speed 10m
  - PM10 & PM2.5 (combined)

### Page 2 — Historical Analysis (up to 2 years)
- Date range picker with 2-year max enforcement
- **6 Historical Charts**:
  - Temperature: Mean, Max, Min (line)
  - Sunrise & Sunset in IST (line, hour float axis)
  - Precipitation Total (bar)
  - Max Wind Speed (line)
  - Dominant Wind Direction (scatter)
  - PM10 & PM2.5 daily averages (line)

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Data**: Open-Meteo Forecast, Archive & Air Quality APIs
- **Charts**: ApexCharts (react-apexcharts) — zoom, pan, scroll
- **State / Data Fetching**: TanStack React Query (5-min stale time)
- **Styling**: Tailwind CSS + custom CSS design system
- **Date Handling**: date-fns, date-fns-tz

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — allow location access when prompted.

## Build

```bash
npm run build
npm run preview
```

## API Sources

| API | URL |
|-----|-----|
| Forecast | https://api.open-meteo.com/v1/forecast |
| Air Quality | https://air-quality-api.open-meteo.com/v1/air-quality |
| Archive | https://archive-api.open-meteo.com/v1/archive |

All APIs are **free, no API key required**.

## Performance

- React Query caches results (5-min stale time) — subsequent navigations render instantly
- GPS fallback defaults to Dehradun coordinates if permission is denied
- Skeleton loading states shown while data is in-flight
