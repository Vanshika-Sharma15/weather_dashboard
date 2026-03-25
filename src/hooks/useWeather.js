import { useQuery } from "@tanstack/react-query";
import { getWeather } from "../api/weatherService";

export default function useWeather(lat, lon, date) {
  return useQuery({
    queryKey: ["weather", lat, lon, date], 
    queryFn: () => getWeather(lat, lon, date),
    staleTime: 600000,
  });
}