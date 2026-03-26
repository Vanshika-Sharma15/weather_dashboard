import { useQuery } from "@tanstack/react-query";
import { getWeather, getWeatherArchive } from "../api/weatherService";

// Days between today and a "YYYY-MM-DD" string (positive = past)
function daysAgoFromStr(dateStr) {
  const selected = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - selected) / 86400000);
}

export default function useWeather(lat, lon, dateStr) {
  const daysAgo = daysAgoFromStr(dateStr);
  // Forecast API covers today + past 92 days via past_days param
  // Anything older needs the archive API
  const useArchive = daysAgo > 92;

  return useQuery({
    queryKey: ["weather", lat, lon, useArchive ? dateStr : "forecast"],
    queryFn: () =>
      useArchive
        ? getWeatherArchive(lat, lon, dateStr)
        : getWeather(lat, lon),
    // Past data never changes — cache it forever; today's data refreshes every 5 min
    staleTime: daysAgo > 1 ? Infinity : 300000,
    enabled: !!lat && !!lon && !!dateStr,
  });
}

