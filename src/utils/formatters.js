export const convertTemp = (val, unit) =>
  unit === "F" ? parseFloat(((val * 9) / 5 + 32).toFixed(1)) : parseFloat(val.toFixed(1));

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const formatTime = (iso) => {
  if (!iso) return "";
  const timePart = iso.split("T")[1];
  if (!timePart) return "";
  const [hStr, mStr] = timePart.split(":");
  const hours = parseInt(hStr, 10);
  const minutes = mStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const formatHour = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.getHours().toString().padStart(2, "0") + ":00";
};

export const getWeatherEmoji = (code) => {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌡️";
};

export const getAqiLabel = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "#22c55e" };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#f97316" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7" };
  return { label: "Hazardous", color: "#7f1d1d" };
};

export const getWindDirection = (deg) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

// Slice hourly data to selected date only (24 hrs)
export const sliceToDate = (times, values, dateStr) => {
  const indices = times
    .map((t, i) => (t.startsWith(dateStr) ? i : -1))
    .filter((i) => i !== -1);
  return {
    times: indices.map((i) => formatHour(times[i])),
    values: indices.map((i) => (values[i] == null ? null : values[i])),
  };
};
