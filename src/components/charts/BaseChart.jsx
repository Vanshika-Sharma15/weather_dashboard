import Chart from "react-apexcharts";

export default function BaseChart({ title, categories, series }) {
  const options = {
    chart: {
      type: "line",
      zoom: { enabled: true },
      toolbar: {
        show: true,
      },
    },

    stroke: {
      curve: "smooth",
      width: 2,
    },

    tooltip: {
      theme: "dark", // ✅ FIX: removes white box issue
    },

    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          colors: "#9ca3af",
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
        },
      },
    },

    grid: {
      borderColor: "#374151",
    },

    legend: {
      labels: {
        colors: "#ffffff",
      },
    },
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-3 text-white">{title}</h2>

      <Chart
        options={options}
        series={series}
        type="line"
        height={320}
      />
    </div>
  );
}