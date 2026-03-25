import { useState } from "react";
import DatePicker from "react-datepicker";
import useGeolocation from "../hooks/useGeolocation";
import { getHistorical } from "../api/weatherService";
import BaseChart from "../components/charts/BaseChart";

export default function Historical() {
  const { lat, lon } = useGeolocation();

  const [start, setStart] = useState(new Date("2024-01-01"));
  const [end, setEnd] = useState(new Date());
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await getHistorical(
      lat,
      lon,
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0]
    );
    setData(res);
  };

  return (
    <div className="p-6 ml-0 md:ml-64 space-y-6">
      <div className="flex gap-4">
        <DatePicker selected={start} onChange={setStart} />
        <DatePicker selected={end} onChange={setEnd} />
        <button onClick={fetchData}>Load</button>
      </div>

      {data && (
        <>
  {/* Temperature */}
  <BaseChart
    title="Temperature Trends"
    categories={data.weather.daily.time}
    series={[
      { name: "Max", data: data.weather.daily.temperature_2m_max },
      { name: "Min", data: data.weather.daily.temperature_2m_min },
      { name: "Mean", data: data.weather.daily.temperature_2m_mean },
    ]}
  />

  {/* Sun Cycle (IST handled automatically by browser) */}
  <BaseChart
    title="Sunrise / Sunset"
    categories={data.weather.daily.time}
    series={[
      { name: "Sunrise", data: data.weather.daily.sunrise },
      { name: "Sunset", data: data.weather.daily.sunset },
    ]}
  />

  {/* Precipitation */}
  <BaseChart
    title="Precipitation"
    categories={data.weather.daily.time}
    series={[
      { name: "Rain", data: data.weather.daily.precipitation_sum },
    ]}
  />

  {/* Wind */}
  <BaseChart
    title="Wind Speed & Direction"
    categories={data.weather.daily.time}
    series={[
      { name: "Speed", data: data.weather.daily.windspeed_10m_max },
      { name: "Direction", data: data.weather.daily.winddirection_10m_dominant },
    ]}
  />

  {/* Air Quality */}
  <BaseChart
    title="Air Quality Trends"
    categories={data.air.hourly.time}
    series={[
      { name: "PM10", data: data.air.hourly.pm10 },
      { name: "PM2.5", data: data.air.hourly.pm2_5 },
    ]}
  />
</>
      )}
    </div>
  );
}