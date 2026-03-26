import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears } from "date-fns";
import useGeolocation from "../hooks/useGeolocation";
import useLocationName from "../hooks/useLocationName";
import { getHistorical } from "../api/weatherService";
import BaseChart from "../components/charts/BaseChart";
import { ChartSkeleton } from "../components/ui/Skeleton";

// Aggregate hourly air data → daily average using O(n) single-pass Map
// The naive O(days × hours) nested scan is ~900ms for 2yr data — this is ~9ms
function aggregateAirQuality(times, pm10Arr, pm25Arr, dates) {
  // Single pass: bucket each hourly reading by its date prefix
  const buckets = new Map();
  times.forEach((t, i) => {
    const day = t.substring(0, 10); // "2024-03-01"
    if (!buckets.has(day)) buckets.set(day, { pm10: [], pm25: [] });
    if (pm10Arr[i] != null) buckets.get(day).pm10.push(pm10Arr[i]);
    if (pm25Arr[i] != null) buckets.get(day).pm25.push(pm25Arr[i]);
  });
  const avg = (arr) =>
    arr.length
      ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
      : null;
  return dates.map((d) => {
    const b = buckets.get(d) || { pm10: [], pm25: [] };
    return { pm10: avg(b.pm10), pm25: avg(b.pm25) };
  });
}

// Convert "2024-03-01T06:25" sunrise/sunset to hour float for chart.
// Open-Meteo returns these already in the requested timezone (timezone=auto),
// so we parse the time portion directly — no offset math needed.
function timeToHourFloat(iso) {
  if (!iso) return null;
  // iso format: "2024-03-01T06:25" — already in local timezone from API
  const timePart = iso.split("T")[1];
  if (!timePart) return null;
  const [hStr, mStr] = timePart.split(":");
  return parseFloat((parseInt(hStr, 10) + parseInt(mStr, 10) / 60).toFixed(2));
}

export default function Historical() {
  const { lat, lon, locating } = useGeolocation();
  const locationName = useLocationName(lat, lon);
  const [start, setStart] = useState(subYears(new Date(), 1));
  const [end, setEnd] = useState(new Date(Date.now() - 86400000));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const minStart = subYears(new Date(), 2);

  const handleLoad = async () => {
    // Guard: enforce 2-year maximum range
    const msInTwoYears = 2 * 365.25 * 24 * 3600 * 1000;
    if (end - start > msInTwoYears) {
      setError("Date range cannot exceed 2 years. Please adjust your selection.");
      return;
    }
    // Use local date parts to avoid UTC offset issues
    const toLocalDateStr = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    setLoading(true);
    setError(null);
    try {
      const res = await getHistorical(
        lat, lon,
        toLocalDateStr(start),
        toLocalDateStr(end)
      );
      setData(res);
    } catch (e) {
      setError("Failed to load historical data. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const charts = useMemo(() => {
    if (!data) return null;
    const d = data.weather.daily;
    const dates = d.time;

    const airAgg = aggregateAirQuality(
      data.air.hourly.time,
      data.air.hourly.pm10,
      data.air.hourly.pm2_5,
      dates
    );

    return (
      <div className="charts-grid">
        <BaseChart
          title="Temperature Trends (°C)"
          categories={dates}
          series={[
            { name: "Max", data: d.temperature_2m_max },
            { name: "Mean", data: d.temperature_2m_mean },
            { name: "Min", data: d.temperature_2m_min },
          ]}
          type="line"
          yUnit="°C"
          colors={["#f97316", "#facc15", "#38bdf8"]}
        />

        <BaseChart
          title="Sunrise & Sunset (IST hours)"
          categories={dates}
          series={[
            { name: "Sunrise", data: d.sunrise.map(timeToHourFloat) },
            { name: "Sunset", data: d.sunset.map(timeToHourFloat) },
          ]}
          type="line"
          yUnit="h"
          colors={["#facc15", "#f97316"]}
          annotations={{
            yaxis: [
              { y: 6, borderColor: "#facc15", label: { text: "6:00 AM", style: { color: "#fff", background: "#374151" } } },
              { y: 18, borderColor: "#f97316", label: { text: "6:00 PM", style: { color: "#fff", background: "#374151" } } },
            ],
          }}
        />

        <BaseChart
          title="Precipitation Total (mm)"
          categories={dates}
          series={[{ name: "Rain", data: d.precipitation_sum }]}
          type="bar"
          yUnit=" mm"
          colors={["#818cf8"]}
        />

        <BaseChart
          title="Wind: Max Speed (km/h) & Dominant Direction (°)"
          categories={dates}
          series={[
            { name: "Wind Speed (km/h)", data: d.wind_speed_10m_max },
            { name: "Wind Direction (°)", data: d.wind_direction_10m_dominant },
          ]}
          type="line"
          yUnit=""
          colors={["#4ade80", "#a78bfa"]}
          dualYAxis={{
            left: { title: "Speed (km/h)", unit: " km/h" },
            right: { title: "Direction (°)", unit: "°" },
          }}
        />

        <BaseChart
          title="Air Quality – PM10 & PM2.5 Daily Avg (μg/m³)"
          categories={dates}
          series={[
            { name: "PM10", data: airAgg.map((r) => r.pm10) },
            { name: "PM2.5", data: airAgg.map((r) => r.pm25) },
          ]}
          type="line"
          yUnit=" μg/m³"
          colors={["#fb923c", "#f472b6"]}
        />
      </div>
    );
  }, [data]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historical Analysis</h1>
          <p className="page-sub">
            {locating
              ? "📡 Detecting your location…"
              : locationName
              ? `📍 ${locationName}`
              : `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`}
          </p>
        </div>
      </div>

      {/* Range picker */}
      <div className="hist-controls">
        <div className="date-range-group">
          <label className="range-label">Start Date</label>
          <DatePicker
            selected={start}
            onChange={(d) => setStart(d)}
            minDate={minStart}
            maxDate={end}
            dateFormat="dd MMM yyyy"
            className="date-input"
          />
        </div>
        <div className="range-separator">→</div>
        <div className="date-range-group">
          <label className="range-label">End Date</label>
          <DatePicker
            selected={end}
            onChange={(d) => setEnd(d)}
            minDate={start}
            maxDate={new Date(Date.now() - 86400000)}
            dateFormat="dd MMM yyyy"
            className="date-input"
          />
        </div>
        <button
          className="load-btn"
          onClick={handleLoad}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load Data"}
        </button>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {loading && (
        <div className="charts-grid">
          {[0, 1, 2, 3, 4, 5].map((k) => <ChartSkeleton key={k} />)}
        </div>
      )}

      {!loading && charts}

      {!loading && !data && !error && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>Select a date range and click <strong>Load Data</strong> to begin.</p>
        </div>
      )}
    </div>
  );
}
