import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears } from "date-fns";
import useGeolocation from "../hooks/useGeolocation";
import { getHistorical } from "../api/weatherService";
import BaseChart from "../components/charts/BaseChart";
import { ChartSkeleton } from "../components/ui/Skeleton";

// Aggregate hourly air data → daily average
function aggregateAirQuality(times, pm10Arr, pm25Arr, dates) {
  return dates.map((d) => {
    const indices = times
      .map((t, i) => (t.startsWith(d) ? i : -1))
      .filter((i) => i !== -1);
    const avg = (arr) => {
      const valid = indices.map((i) => arr[i]).filter((v) => v != null);
      return valid.length ? parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)) : null;
    };
    return { pm10: avg(pm10Arr), pm25: avg(pm25Arr) };
  });
}

// Convert "2024-03-01T06:25" sunrise/sunset to hour float for chart
function timeToHourFloat(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  // IST = UTC+5:30
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const istMs = utcMs + 5.5 * 3600000;
  const ist = new Date(istMs);
  return parseFloat((ist.getHours() + ist.getMinutes() / 60).toFixed(2));
}

function timeToLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const istMs = utcMs + 5.5 * 3600000;
  const ist = new Date(istMs);
  return `${ist.getHours().toString().padStart(2, "0")}:${ist.getMinutes().toString().padStart(2, "0")}`;
}

export default function Historical() {
  const { lat, lon } = useGeolocation();
  const [start, setStart] = useState(subYears(new Date(), 1));
  const [end, setEnd] = useState(new Date(Date.now() - 86400000 * 2));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const minStart = subYears(new Date(), 2);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistorical(
        lat, lon,
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      setData(res);
    } catch (e) {
      setError("Failed to load historical data. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!data) return null;
    const d = data.weather.daily;
    const dates = d.time; // ["2024-01-01", ...]

    const airAgg = aggregateAirQuality(
      data.air.hourly.time,
      data.air.hourly.pm10,
      data.air.hourly.pm2_5,
      dates
    );

    return (
      <div className="charts-grid">
        {/* Temperature */}
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

        {/* Sun Cycle IST */}
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

        {/* Precipitation */}
        <BaseChart
          title="Precipitation Total (mm)"
          categories={dates}
          series={[{ name: "Rain", data: d.precipitation_sum }]}
          type="bar"
          yUnit=" mm"
          colors={["#818cf8"]}
        />

        {/* Wind */}
        <BaseChart
          title="Max Wind Speed (km/h)"
          categories={dates}
          series={[
            { name: "Wind Speed", data: d.wind_speed_10m_max },
          ]}
          type="line"
          yUnit=" km/h"
          colors={["#4ade80"]}
        />

        {/* Wind Direction */}
        <BaseChart
          title="Dominant Wind Direction (°)"
          categories={dates}
          series={[
            { name: "Direction", data: d.wind_direction_10m_dominant },
          ]}
          type="scatter"
          yUnit="°"
          colors={["#a78bfa"]}
        />

        {/* Air Quality PM10 & PM2.5 */}
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
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historical Analysis</h1>
          <p className="page-sub">Up to 2 years of historical weather data</p>
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
            maxDate={new Date(Date.now() - 86400000 * 2)}
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

      {!loading && renderCharts()}

      {!loading && !data && !error && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>Select a date range and click <strong>Load Data</strong> to begin.</p>
        </div>
      )}
    </div>
  );
}
