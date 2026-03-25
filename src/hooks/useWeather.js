import { useQuery } from "@tanstack/react-query";
import { getWeather } from "../api/weatherService";

export default function useWeather(lat, lon) {
  return useQuery({
    queryKey: ["weather", lat, lon],
    queryFn: () => getWeather(lat, lon),
    staleTime: 300000, // 5 min
    enabled: !!lat && !!lon,
  });
}
