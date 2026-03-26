import axios from "axios";

const BASE = "https://api.open-meteo.com/v1";
const AIR = "https://air-quality-api.open-meteo.com/v1";
const ARCHIVE = "https://archive-api.open-meteo.com/v1";

// Today's data: current readings + 7-day forecast hourly
export async function getWeather(lat, lon) {
  const [weather, air] = await Promise.all([
    axios.get(`${BASE}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        daily:
          "temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max,precipitation_sum",
        hourly:
          "temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m,uv_index,precipitation_probability",
        timezone: "auto",
        forecast_days: 1,
        past_days: 92,
      },
    }),
    axios.get(`${AIR}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide",
        hourly:
          "pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,us_aqi",
        timezone: "auto",
        forecast_days: 1,
        past_days: 92,
      },
    }),
  ]);

  return { weather: weather.data, air: air.data, mode: "forecast" };
}

// Past date older than 92 days: use archive API (daily only, no hourly)
export async function getWeatherArchive(lat, lon, dateStr) {
  const [weather, air] = await Promise.all([
    axios.get(`${ARCHIVE}/archive`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: dateStr,
        end_date: dateStr,
        daily:
          "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset,uv_index_max",
        hourly:
          "temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m",
        timezone: "auto",
      },
    }),
    axios.get(`${AIR}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: dateStr,
        end_date: dateStr,
        hourly: "pm10,pm2_5,us_aqi",
        timezone: "auto",
      },
    }),
  ]);

  return { weather: weather.data, air: air.data, mode: "archive" };
}

export async function getHistorical(lat, lon, start, end) {
  const [weather, air] = await Promise.all([
    axios.get(`${ARCHIVE}/archive`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: start,
        end_date: end,
        daily:
          "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset",
        timezone: "auto",
      },
    }),
    axios.get(`${AIR}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: start,
        end_date: end,
        hourly: "pm10,pm2_5",
        timezone: "auto",
      },
    }),
  ]);

  return { weather: weather.data, air: air.data };
}
