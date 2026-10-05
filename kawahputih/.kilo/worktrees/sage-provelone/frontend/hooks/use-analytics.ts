import { useQuery } from "@tanstack/react-query";
import { managerService, type DateRangePreset, type ManagerAnalytics } from "@/services/dashboard.service";

// ============================================================================
// useManagerAnalytics — analytics manager dihitung dari mock DB.
// Data reaktif terhadap perubahan booking (hook membaca snapshot DB).
// ============================================================================

export function useManagerAnalytics(range: DateRangePreset = "7d", custom?: { from: string; to: string }) {
  return useQuery<ManagerAnalytics>({
    queryKey: ["manager", "analytics", range, custom?.from, custom?.to],
    queryFn: () => Promise.resolve(managerService.getAnalytics(range, custom)),
    staleTime: 5_000,
  });
}
