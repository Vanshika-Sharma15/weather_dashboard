import Chart from "react-apexcharts";
import { memo } from "react";

function BaseChart({
  title,
  categories,
  series,
  type = "line",
  height = 300,
  yUnit = "",
  colors,
  annotations,
  dualYAxis,
}) {
  const chartColors = colors || [
    "#38bdf8", "#fb923c", "#4ade80", "#f472b6", "#a78bfa", "#facc15",
  ];

  const options = {
    chart: {
      type,
      background: "transparent",
      zoom: { enabled: true, type: "x", autoScaleYaxis: true },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      // Disable animations for large datasets (>100 pts) to stay within 500ms render budget
      animations: {
        enabled: categories.length <= 100,
        speed: 250,
        animateGradually: { enabled: false },
      },
    },
    annotations: annotations || {},
    colors: chartColors,
    stroke: {
      curve: "smooth",
      width: type === "bar" ? 0 : 2.5,
    },
    fill: {
      type: type === "area" ? "gradient" : "solid",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val, { seriesIndex }) => {
          if (val === null || val === undefined) return "N/A";
          if (dualYAxis) {
            const unit = seriesIndex === 0 ? dualYAxis.left.unit : dualYAxis.right.unit;
            return `${val}${unit}`;
          }
          return `${val}${yUnit}`;
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { colors: "#6b7280", fontSize: "11px", fontFamily: "'Space Mono', monospace" },
        maxHeight: 60,
      },
      axisBorder: { color: "#1f2937" },
      axisTicks: { color: "#1f2937" },
      tickAmount: Math.min(categories.length, 12),
    },
    yaxis: dualYAxis
      ? [
          {
            title: { text: dualYAxis.left.title, style: { color: chartColors[0] } },
            labels: {
              style: { colors: chartColors[0], fontFamily: "'Space Mono', monospace" },
              formatter: (val) => (val != null ? `${Number(val).toFixed(1)}${dualYAxis.left.unit}` : ""),
            },
          },
          {
            opposite: true,
            title: { text: dualYAxis.right.title, style: { color: chartColors[1] } },
            labels: {
              style: { colors: chartColors[1], fontFamily: "'Space Mono', monospace" },
              formatter: (val) => (val != null ? `${Number(val).toFixed(1)}${dualYAxis.right.unit}` : ""),
            },
            min: 0,
            max: 360,
          },
        ]
      : {
          min: type === "bar" ? 0 : undefined,
          // forceNiceScale ensures bar charts with all-zero data still show a visible axis
          // (without this, yaxis collapses to 0–0 and all bars become invisible)
          forceNiceScale: type === "bar",
          labels: {
            style: { colors: "#6b7280", fontFamily: "'Space Mono', monospace" },
            formatter: (val) => (val !== null ? `${Number(val).toFixed(1)}${yUnit}` : ""),
          },
        },
    grid: {
      borderColor: "#111827",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    legend: {
      labels: { colors: "#9ca3af" },
      fontFamily: "'DM Sans', sans-serif",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-scroll-wrapper">
        <div style={{ minWidth: Math.max(categories.length * 28, 320) + "px" }}>
          <Chart
            options={options}
            series={series}
            type={type}
            height={height}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(BaseChart);
