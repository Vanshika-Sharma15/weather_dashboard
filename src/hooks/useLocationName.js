import { useEffect, useState } from "react";

// Reverse geocode using Open-Meteo's companion geocoding API (no key needed)
export default function useLocationName(lat, lon) {
  const [name, setName] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        signal: controller.signal,
        headers: { "Accept-Language": "en" },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const addr = data.address || {};
        // Prefer city > town > village > county > state
        const city =
          addr.city || addr.town || addr.village || addr.county || addr.state || null;
        const state = addr.state || "";
        setName(city ? `${city}${state && city !== state ? ", " + state : ""}` : null);
      })
      .catch(() => {}); // silently ignore (offline / permission denied)

    return () => controller.abort();
  }, [lat, lon]);

  return name;
}
