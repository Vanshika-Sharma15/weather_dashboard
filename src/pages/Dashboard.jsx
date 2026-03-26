import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears } from "date-fns";
import useGeolocation from "../hooks/useGeolocation";
import useWeather from "../hooks/useWeather";
import useLocationName from "../hooks/useLocationName";
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

// Local date string "YYYY-MM-DD" — avoids UTC offset issues
function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const { lat, lon, locating } = useGeolocation();
  const locationName = useLocationName(lat, lon);
  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());

  const dateStr = toLocalDateStr(date);
  const todayStr = toLocalDateStr(new Date());
  const isToday = dateStr === todayStr;

  // useWeather is now date-aware: picks forecast API (today/recent) or archive API (older)
  const { data, isLoading, error } = useWeather(lat, lon, dateStr);
  const isReady = !isLoading && !!data;

  const parsed = useMemo(() => {
    if (!isReady) return null;

    const w = data.weather;
    const a = data.air;
    const mode = data.mode; // "forecast" | "archive"

    // Daily index for selected date
    const dayIdx = (w.daily?.time || []).indexOf(dateStr);
    const idx = dayIdx === -1 ? 0 : dayIdx;

    // Hourly slices — weather
    const hTime = w.hourly?.time || [];
    const temp   = sliceToDate(hTime, w.hourly?.temperature_2m || [], dateStr);
    const hum    = sliceToDate(hTime, w.hourly?.relative_humidity_2m || [], dateStr);
    const precip = sliceToDate(hTime, w.hourly?.precipitation || [], dateStr);
    const vis    = sliceToDate(hTime, w.hourly?.visibility || [], dateStr);
    const wind   = sliceToDate(hTime, w.hourly?.wind_speed_10m || [], dateStr);

    // Hourly slices — air quality
    const aTime      = a.hourly?.time || [];
    const pm10Hourly = sliceToDate(aTime, a.hourly?.pm10 || [], dateStr);
    const pm25Hourly = sliceToDate(aTime, a.hourly?.pm2_5 || [], dateStr);
    const coHourly   = sliceToDate(aTime, a.hourly?.carbon_monoxide || [], dateStr);
    const no2Hourly  = sliceToDate(aTime, a.hourly?.nitrogen_dioxide || [], dateStr);
    const so2Hourly  = sliceToDate(aTime, a.hourly?.sulphur_dioxide || [], dateStr);
    const aqiHourly  = sliceToDate(aTime, a.hourly?.us_aqi || [], dateStr);

    // CO2 from hourly (never in current endpoint)
    const co2Idx = aTime.findIndex((t) => t.startsWith(dateStr));
    const co2 = co2Idx !== -1 ? a.hourly?.carbon_dioxide?.[co2Idx] : null;

    // Representative hour for stat card values
    const nowHour = new Date().getHours();
    const repHour = isToday
      ? Math.min(nowHour, Math.max((temp.values.length || 1) - 1, 0))
      : Math.min(12, Math.max((temp.values.length || 1) - 1, 0));

    const atHour = (arr) =>
      arr[repHour] != null ? arr[repHour] : arr.find((v) => v != null) ?? null;

    // For today: use live current readings; for past: use hourly/daily values
    const isLive = isToday && mode === "forecast";
    const tempCurrent = isLive
      ? w.current?.temperature_2m
      : atHour(temp.values) ?? w.daily?.temperature_2m_mean?.[idx];

    const aqi = isLive ? a.current?.us_aqi : atHour(aqiHourly.values);

    return {
      tempCurrent,
      tempMax:  w.daily?.temperature_2m_max?.[idx],
      tempMin:  w.daily?.temperature_2m_min?.[idx],
      sunrise:  formatTime(w.daily?.sunrise?.[idx]),
      sunset:   formatTime(w.daily?.sunset?.[idx]),
      humidity:      atHour(hum.values),
      precipitation: w.daily?.precipitation_sum?.[idx] ?? atHour(precip.values),
      precipProbMax: w.daily?.precipitation_probability_max?.[idx] ?? null,
      uvIndex:  w.daily?.uv_index_max?.[idx],
      windMax:  w.daily?.wind_speed_10m_max?.[idx],
      weatherCode: mode === "forecast" ? w.current?.weather_code : null,
      aqi,
      aqiInfo: getAqiLabel(aqi),
      pm10: isLive ? a.current?.pm10  : atHour(pm10Hourly.values),
      pm25: isLive ? a.current?.pm2_5 : atHour(pm25Hourly.values),
      co:   isLive ? a.current?.carbon_monoxide  : atHour(coHourly.values),
      co2,
      no2:  isLive ? a.current?.nitrogen_dioxide : atHour(no2Hourly.values),
      so2:  isLive ? a.current?.sulphur_dioxide  : atHour(so2Hourly.values),
      tempChart: temp,
      humChart:  hum,
      precipChart: precip,
      visChart:  vis,
      windChart: wind,
      pm10Chart: pm10Hourly,
      pm25Chart: pm25Hourly,
      isArchive: mode === "archive",
    };
  }, [isReady, data, dateStr, isToday]);

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
          <h1 className="page-title">
            {isToday
              ? "Current Weather"
              : `Weather · ${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
          </h1>
          <p className="page-sub">
            {locating
              ? "📡 Detecting your location…"
              : locationName
              ? `📍 ${locationName}`
              : `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`}
          </p>
        </div>
        <div className="header-controls">
          <div className="date-picker-wrap">
            <DatePicker
              selected={date}
              onChange={setDate}
              minDate={subYears(new Date(), 2)}
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              className="date-input"
              calendarClassName="dark-cal"
            />
          </div>
          <button
            className={`unit-toggle ${unit === "C" ? "active" : ""}`}
            onClick={() => setUnit("C")}
          >°C</button>
          <button
            className={`unit-toggle ${unit === "F" ? "active" : ""}`}
            onClick={() => setUnit("F")}
          >°F</button>
        </div>
      </div>

      {/* Condition hero */}
      {isReady && parsed ? (
        <div className="condition-hero">
          <div className="condition-emoji">
            {parsed.weatherCode != null ? getWeatherEmoji(parsed.weatherCode) : "📅"}
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

      {/* Archive notice for dates older than 92 days */}
      {isReady && parsed?.isArchive && (
        <div className="archive-notice">
          📂 Historical archive data — CO, NO₂, SO₂ and CO₂ are unavailable for dates older than 92 days.
        </div>
      )}

      {/* STAT CARDS */}
      <section className="section-label">Temperature</section>
      <div className="stats-grid">
        {isReady && parsed ? (
          <>
            <StatCard icon="🌡️" label={isToday ? "Current" : "Mean"} value={toTempDisplay(parsed.tempCurrent)} unit={`°${unit}`} />
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
            <StatCard icon="☀️" label="UV Index" value={parsed.uvIndex}
              sub={parsed.uvIndex != null ? (parsed.uvIndex > 7 ? "High" : parsed.uvIndex > 3 ? "Moderate" : "Low") : null} />
            <StatCard icon="🌬️" label="Wind Speed Max" value={parsed.windMax} unit=" km/h" />
            {parsed.precipProbMax != null && (
              <StatCard icon="🌂" label="Precip. Prob. Max" value={parsed.precipProbMax} unit="%" />
            )}
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
            <StatCard icon="🫁" label="AQI (US)" value={parsed.aqi}
              sub={parsed.aqiInfo?.label} accent={parsed.aqiInfo?.color} />
            <StatCard icon="🔬" label="PM10" value={parsed.pm10?.toFixed(1)} unit=" μg/m³" />
            <StatCard icon="🔬" label="PM2.5" value={parsed.pm25?.toFixed(1)} unit=" μg/m³" />
            {!parsed.isArchive && (
              <>
                <StatCard icon="💨" label="CO"  value={parsed.co?.toFixed(1)}  unit=" μg/m³" />
                <StatCard icon="🌫️" label="CO₂" value={parsed.co2?.toFixed(1)} unit=" ppm" />
                <StatCard icon="🟡" label="NO₂" value={parsed.no2?.toFixed(1)} unit=" μg/m³" />
                <StatCard icon="🟠" label="SO₂" value={parsed.so2?.toFixed(1)} unit=" μg/m³" />
              </>
            )}
          </>
        ) : [0, 1, 2, 3, 4, 5, 6].map((k) => <StatSkeleton key={k} />)}
      </div>

      {/* HOURLY CHARTS */}
      <section className="section-label">Hourly Charts</section>
      {isReady && parsed ? (
        <div className="charts-grid">
          <BaseChart
            title={`Temperature (°${unit})`}
            categories={parsed.tempChart.times}
            series={[{ name: `Temp °${unit}`, data: parsed.tempChart.values.map((v) => toTempDisplay(v)) }]}
            type="area" yUnit={`°${unit}`} colors={["#f97316"]}
          />
          <BaseChart
            title="Relative Humidity (%)"
            categories={parsed.humChart.times}
            series={[{ name: "Humidity", data: parsed.humChart.values }]}
            type="area" yUnit="%" colors={["#38bdf8"]}
          />
          <BaseChart
            title="Precipitation (mm)"
            categories={parsed.precipChart.times}
            series={[{ name: "Rain", data: parsed.precipChart.values }]}
            type="bar" yUnit=" mm" colors={["#818cf8"]}
          />
          <BaseChart
            title="Visibility (m)"
            categories={parsed.visChart.times}
            series={[{ name: "Visibility", data: parsed.visChart.values }]}
            type="area" yUnit=" m" colors={["#4ade80"]}
          />
          <BaseChart
            title="Wind Speed 10m (km/h)"
            categories={parsed.windChart.times}
            series={[{ name: "Wind", data: parsed.windChart.values }]}
            type="line" yUnit=" km/h" colors={["#facc15"]}
          />
          <BaseChart
            title="PM10 & PM2.5 (μg/m³)"
            categories={parsed.pm10Chart.times}
            series={[
              { name: "PM10", data: parsed.pm10Chart.values },
              { name: "PM2.5", data: parsed.pm25Chart.values },
            ]}
            type="line" yUnit=" μg/m³" colors={["#fb923c", "#f472b6"]}
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
