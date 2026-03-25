import Chart from "react-apexcharts";
import { memo } from "react";

function TempChart({ data }) {
  const options = {
    chart: { type: "line", zoom: { enabled: true } },
    stroke: { curve: "smooth" },
    xaxis: { categories: data.time.slice(0, 24) },
  };

  const series = [
    {
      name: "Temperature",
      data: data.temperature_2m.slice(0, 24),
    },
  ];

  return <Chart options={options} series={series} height={320} />;
}

export default memo(TempChart);