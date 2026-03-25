export function exportToCSV(data, filename = "data.csv") {
  const rows = Object.keys(data).map((key, i) => ({
    time: data.time[i],
    value: data.temperature_2m[i],
  }));

  const csv =
    "time,value\n" +
    rows.map((r) => `${r.time},${r.value}`).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}