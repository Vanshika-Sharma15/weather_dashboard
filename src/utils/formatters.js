// Temperature Conversion
export const convertTemp = (val, unit) =>
  unit === "F" ? (val * 9) / 5 + 32 : val;

// Format Date (DD/MM/YYYY)
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN");

// ✅ Format Time in IST (CRITICAL FIX)
export const formatTime = (iso) => {
  if (!iso) return "";

  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata", // ✅ REQUIRED
    hour: "2-digit",
    minute: "2-digit",
  });
};