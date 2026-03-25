import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useGeolocation from "../hooks/useGeolocation";
import useWeather from "../hooks/useWeather";
import BaseChart from "../components/charts/BaseChart";
import StatCard from "../components/ui/StatCard";
import { StatSkeleton, ChartSkeleton } from "../components/ui/Skeleton";
import {
  convertTemp,
  formatTime,
  sliceToDate,
  getWeatherEmoji,
  getAqiLabel,
} from "../utils/formatters";

export default function Dashboard() {
  const { lat, lon, loading: geoLoading } = useGeolocation();
  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());

  const dateStr = date.toISOString().split("T")[0];

  const { data, isLoading, error } = useWeather(lat, lon);

  const isReady = !geoLoading && !isLoading && data;

  // Parse and slice data for the selected date
  const parsed = useMemo(() => {
    if (!isReady) return null;

    const w = data.weather;
    const a = data.air;

    // Find day index in daily data
    const dayIdx = w.daily.time.indexOf(dateStr);
    const idx = dayIdx === -1 ? 0 : dayIdx;

    // Hourly slices
    const hTime = w.hourly.time;
    const temp = sliceToDate(hTime, w.hourly.temperature_2m, dateStr);
    const hum = sliceToDate(hTime, w.hourly.relative_humidity_2m, dateStr);
    const precip = sliceToDate(hTime, w.hourly.precipitation, dateStr);
    const vis = sliceToDate(hTime, w.hourly.visibility, dateStr);
    const wind = sliceToDate(hTime, w.hourly.wind_speed_10m, dateStr);

    const aTime = a.hourly.time;
    const pm10 = sliceToDate(aTime, a.hourly.pm10, dateStr);
    const pm25 = sliceToDate(aTime, a.hourly.pm2_5, dateStr);

    // Current values
    const currentTemp = w.current.temperature_2m;
    const aqi = a.current?.us_aqi;
    const aqiInfo = getAqiLabel(aqi);

    // Determine current hour index for humidity/precipitation
    const nowHour = new Date().getHours();
    const humCurrent = hum.values[nowHour] ?? hum.values[0];
    const precipCurrent = precip.values[nowHour] ?? precip.values[0];

    return {
      // Stats
      tempCurrent: currentTemp,
      tempMax: w.daily.temperature_2m_max[idx],
      tempMin: w.daily.temperature_2m_min[idx],
      sunrise: formatTime(w.daily.sunrise[idx]),
      sunset: formatTime(w.daily.sunset[idx]),
      humidity: humCurrent,
      precipitation: precipCurrent,
      precipProbMax: w.daily.precipitation_probability_max?.[idx],
      uvIndex: w.daily.uv_index_max?.[idx],
      windMax: w.daily.wind_speed_10m_max?.[idx],
      weatherCode: w.current.weather_code,
      aqi,
      aqiInfo,
      pm10: a.current?.pm10,
      pm25: a.current?.pm2_5,
      co: a.current?.carbon_monoxide,
      co2: (() => {
        // CO2 not in current endpoint — grab from first valid hourly value of selected date
        const idx = a.hourly.time.findIndex((t) => t.startsWith(dateStr));
        return idx !== -1 ? a.hourly.carbon_dioxide?.[idx] : null;
      })(),
      no2: a.current?.nitrogen_dioxide,
      so2: a.current?.sulphur_dioxide,
      // Hourly chart data
      tempChart: temp,
      humChart: hum,
      precipChart: precip,
      visChart: vis,
      windChart: wind,
      pm10Chart: pm10,
      pm25Chart: pm25,
    };
  }, [isReady, data, dateStr, unit]);

  const toTempDisplay = (val) =>
    val != null ? convertTemp(val, unit) : null;

  if (error)
    return (
      <div className="page-content">
        <div className="error-box">⚠️ Failed to load weather data. Please try again.</div>
      </div>
    );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Current Weather</h1>
          <p className="page-sub">
            {geoLoading
              ? "Detecting location…"
              : `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`}
          </p>
        </div>
        <div className="header-controls">
          <div className="date-picker-wrap">
            <DatePicker
              selected={date}
              onChange={setDate}
              maxDate={new Date(Date.now() + 6 * 86400000)}
              dateFormat="dd MMM yyyy"
              className="date-input"
              calendarClassName="dark-cal"
            />
          </div>
          <button
            className={`unit-toggle ${unit === "C" ? "active" : ""}`}
            onClick={() => setUnit("C")}
          >
            °C
          </button>
          <button
            className={`unit-toggle ${unit === "F" ? "active" : ""}`}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
        </div>
      </div>

      {/* Current condition hero */}
      {isReady && parsed ? (
        <div className="condition-hero">
          <div className="condition-emoji">
            {getWeatherEmoji(parsed.weatherCode)}
          </div>
          <div className="condition-temp">
            {toTempDisplay(parsed.tempCurrent)}°{unit}
          </div>
          <div className="condition-range">
            ↑ {toTempDisplay(parsed.tempMax)}° &nbsp; ↓ {toTempDisplay(parsed.tempMin)}°
          </div>
        </div>
      ) : (
        <div className="condition-hero skeleton" style={{ height: 120 }} />
      )}

      {/* ── STAT CARDS ── */}
      <section className="section-label">Temperature</section>
      <div className="stats-grid">
        {isReady && parsed ? (
          <>
            <StatCard icon="🌡️" label="Current" value={toTempDisplay(parsed.tempCurrent)} unit={`°${unit}`} />
            <StatCard icon="🔺" label="Maximum" value={toTempDisplay(parsed.tempMax)} unit={`°${unit}`} accent="#f97316" />
            <StatCard icon="🔻" label="Minimum" value={toTempDisplay(parsed.tempMin)} unit={`°${unit}`} accent="#38bdf8" />
          </>
        ) : [0, 1, 2].map((k) => <StatSkeleton key={k} />)}
      </div>

      <section className="section-label">Atmospheric Conditions</section>
      <div className="stats-grid">
        {isReady && parsed ? (
          <>
            <StatCard icon="💧" label="Precipitation" value={parsed.precipitation} unit=" mm" />
            <StatCard icon="💦" label="Humidity" value={parsed.humidity} unit="%" />
            <StatCard icon="☀️" label="UV Index" value={parsed.uvIndex} sub={parsed.uvIndex > 7 ? "High" : parsed.uvIndex > 3 ? "Moderate" : "Low"} />
            <StatCard icon="🌬️" label="Wind Speed Max" value={parsed.windMax} unit=" km/h" />
            <StatCard icon="🌂" label="Precip. Prob. Max" value={parsed.precipProbMax} unit="%" />
          </>
        ) : [0, 1, 2, 3, 4].map((k) => <StatSkeleton key={k} />)}
      </div>

      <section className="section-label">Sun Cycle</section>
      <div className="stats-grid stats-grid-2">
        {isReady && parsed ? (
          <>
            <StatCard icon="🌅" label="Sunrise" value={parsed.sunrise} accent="#facc15" />
            <StatCard icon="🌇" label="Sunset" value={parsed.sunset} accent="#f97316" />
          </>
        ) : [0, 1].map((k) => <StatSkeleton key={k} />)}
      </div>

      <section className="section-label">Air Quality</section>
      <div className="stats-grid">
        {isReady && parsed ? (
          <>
            <StatCard
              icon="🫁"
              label="AQI (US)"
              value={parsed.aqi}
              sub={parsed.aqiInfo?.label}
              accent={parsed.aqiInfo?.color}
            />
            <StatCard icon="🔬" label="PM10" value={parsed.pm10?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="🔬" label="PM2.5" value={parsed.pm25?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="💨" label="CO" value={parsed.co?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="🌫️" label="CO₂" value={parsed.co2?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="🟡" label="NO₂" value={parsed.no2?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="🟠" label="SO₂" value={parsed.so2?.toFixed(1)} unit=" μg/m³" />
          </>
        ) : [0, 1, 2, 3, 4, 5].map((k) => <StatSkeleton key={k} />)}
      </div>

      {/* ── CHARTS ── */}
      <section className="section-label">Hourly Charts</section>

      {isReady && parsed ? (
        <div className="charts-grid">
          <BaseChart
            title={`Temperature (°${unit})`}
            categories={parsed.tempChart.times}
            series={[{ name: `Temp °${unit}`, data: parsed.tempChart.values.map((v) => toTempDisplay(v)) }]}
            type="area"
            yUnit={`°${unit}`}
            colors={["#f97316"]}
          />
          <BaseChart
            title="Relative Humidity (%)"
            categories={parsed.humChart.times}
            series={[{ name: "Humidity", data: parsed.humChart.values }]}
            type="area"
            yUnit="%"
            colors={["#38bdf8"]}
          />
          <BaseChart
            title="Precipitation (mm)"
            categories={parsed.precipChart.times}
            series={[{ name: "Rain", data: parsed.precipChart.values }]}
            type="bar"
            yUnit=" mm"
            colors={["#818cf8"]}
          />
          <BaseChart
            title="Visibility (m)"
            categories={parsed.visChart.times}
            series={[{ name: "Visibility", data: parsed.visChart.values }]}
            type="area"
            yUnit=" m"
            colors={["#4ade80"]}
          />
          <BaseChart
            title="Wind Speed 10m (km/h)"
            categories={parsed.windChart.times}
            series={[{ name: "Wind", data: parsed.windChart.values }]}
            type="line"
            yUnit=" km/h"
            colors={["#facc15"]}
          />
          <BaseChart
            title="PM10 & PM2.5 (μg/m³)"
            categories={parsed.pm10Chart.times}
            series={[
              { name: "PM10", data: parsed.pm10Chart.values },
              { name: "PM2.5", data: parsed.pm25Chart.values },
            ]}
            type="line"
            yUnit=" μg/m³"
            colors={["#fb923c", "#f472b6"]}
          />
        </div>
      ) : (
        <div className="charts-grid">
          {[0, 1, 2, 3, 4, 5].map((k) => <ChartSkeleton key={k} />)}
        </div>
      )}
    </div>
  );
}
