import { useEffect, useState } from "react";

export default function useGeolocation() {
  // Start with default coords immediately (Dehradun) so data renders right away.
  // GPS will silently upgrade coords in the background — no blocked render.
  const [coords, setCoords] = useState({ lat: 30.3165, lon: 78.0322 });
  const [locating, setLocating] = useState(true); // true = GPS still pending
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setError(err.message);
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // loading is always false — default coords are valid for immediate rendering
  return { ...coords, loading: false, locating, error };
}
