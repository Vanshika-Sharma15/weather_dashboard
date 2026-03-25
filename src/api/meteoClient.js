export async function fetchWeather(lat, lon) {
  try {
    const [weatherRes, airRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`)
    ]);

    if (!weatherRes.ok || !airRes.ok) throw new Error("API Error");

    return {
      weather: await weatherRes.json(),
      air: await airRes.json()
    };
  } catch (err) {
    throw new Error("Failed to fetch weather data");
  }
}