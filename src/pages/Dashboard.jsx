import { useState } from "react";
import useGeolocation from "../hooks/useGeolocation";
import useWeather from "../hooks/useWeather";
import BaseChart from "../components/charts/BaseChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { convertTemp } from "../utils/formatters";

export default function Dashboard() {
  const { lat, lon } = useGeolocation();

  const [unit, setUnit] = useState("C");
  const [date, setDate] = useState(new Date());

  const selectedDate = date.toISOString().split("T")[0];

  const { data, isLoading, error } = useWeather(lat, lon, selectedDate);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">Error loading data</div>;

  const w = data.weather;
  const a = data.air;
  const hourly = w.hourly;

  return (
    <div className="p-6 ml-0 md:ml-64 space-y-6">
      
      {/* DATE + TOGGLE */}
      <div className="flex gap-4 items-center">
        <DatePicker selected={date} onChange={setDate} />

        <button
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
          onClick={() => setUnit(unit === "C" ? "F" : "C")}
        >
          °{unit}
        </button>
      </div>

      {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Temperature */}
        <div>Temp Current: {w.current_weather.temperature}</div>
        <div>Temp Max: {w.daily.temperature_2m_max[0]}</div>
        <div>Temp Min: {w.daily.temperature_2m_min[0]}</div>

        {/* Atmosphere */}
        <div>Humidity: {hourly.relativehumidity_2m[0]}</div>
        <div>Precipitation: {hourly.precipitation[0]}</div>
        <div>Precip Prob Max: {Math.max(...hourly.precipitation_probability)}</div>
        <div>UV Index: {hourly.uv_index[0]}</div>

        {/* Sun */}
        <div>Sunrise: {w.daily.sunrise[0]}</div>
        <div>Sunset: {w.daily.sunset[0]}</div>

        {/* Wind */}
        <div>Wind Speed Max: {Math.max(...hourly.windspeed_10m)}</div>

        {/* Air Quality */}
        <div>AQI: {a.hourly.us_aqi[0]}</div>
        <div>PM10: {a.hourly.pm10[0]}</div>
        <div>PM2.5: {a.hourly.pm2_5[0]}</div>
        <div>CO: {a.hourly.carbon_monoxide[0]}</div>
        <div>CO2: {a.hourly.carbon_dioxide[0]}</div>
        <div>NO2: {a.hourly.nitrogen_dioxide[0]}</div>
        <div>SO2: {a.hourly.sulphur_dioxide[0]}</div>

        </div>

      {/* CHARTS */}

      <BaseChart
        title="Temperature"
        categories={hourly.time}
        series={[
          {
            name: "Temp",
            data: hourly.temperature_2m.map((v) =>
              convertTemp(v, unit)
            ),
          },
        ]}
      />

      <BaseChart
        title="Humidity"
        categories={hourly.time}
        series={[{ name: "Humidity", data: hourly.relativehumidity_2m }]}
      />

      <BaseChart
        title="Precipitation"
        categories={hourly.time}
        series={[{ name: "Rain", data: hourly.precipitation }]}
      />

      <BaseChart
        title="Visibility"
        categories={hourly.time}
        series={[{ name: "Visibility", data: hourly.visibility }]}
      />

      <BaseChart
        title="Wind Speed"
        categories={hourly.time}
        series={[{ name: "Wind", data: hourly.windspeed_10m }]}
      />

      <BaseChart
        title="PM10 & PM2.5"
        categories={hourly.time}
        series={[
          { name: "PM10", data: a.hourly.pm10 },
          { name: "PM2.5", data: a.hourly.pm2_5 },
        ]}
      />
    </div>
  );
}