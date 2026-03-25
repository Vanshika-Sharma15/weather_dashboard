import axios from "axios";

const BASE = "https://api.open-meteo.com/v1";
const AIR = "https://air-quality-api.open-meteo.com/v1";
const ARCHIVE = "https://archive-api.open-meteo.com/v1";

export async function getWeather(lat, lon) {
  const [weather, air] = await Promise.all([
    axios.get(`${BASE}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        daily:
          "temperature_2m_max,temperature_2m_min,sunrise,sunset",
        hourly:
          "temperature_2m,relativehumidity_2m,precipitation,visibility,windspeed_10m,uv_index,precipitation_probability",
      },
    }),
    axios.get(`${AIR}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly:
          "pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,us_aqi",
      },
    }),
  ]);

  return {
    weather: weather.data,
    air: air.data,
  };
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
          "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,sunrise,sunset",
      },
    }),
    axios.get(`${AIR}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: start,
        end_date: end,
        hourly: "pm10,pm2_5",
      },
    }),
  ]);

  return {
    weather: weather.data,
    air: air.data,
  };
}