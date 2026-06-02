import { useQuery } from "@tanstack/react-query";
import { measurementApi } from "../api/dashboard";

export function useMeasurement(id){
  return useQuery({
    queryKey: ['measurements', id],
    queryFn: () => measurementApi.getOne(id),
    enabled: !!id,
  });
}

export function useDebugScore(){
  return useQuery({
    queryKey: ['measurements', 'debug-scores'],
    queryFn: () => measurementApi.getDebugScore(),

  })
}
