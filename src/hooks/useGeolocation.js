import { useEffect, useState } from "react";

export default function useGeolocation() {
  const [coords, setCoords] = useState({ lat: 30.3165, lon: 78.0322 }); // Dehradun default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return { ...coords, loading, error };
}
