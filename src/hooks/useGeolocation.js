import { useEffect, useState } from "react";

export default function useGeolocation() {
  const [coords, setCoords] = useState({ lat: 28.61, lon: 77.20 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => {}
    );
  }, []);

  return coords;
}