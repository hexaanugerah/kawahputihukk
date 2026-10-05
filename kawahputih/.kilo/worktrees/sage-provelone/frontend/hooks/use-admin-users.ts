import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/dashboard.service";

// Hook data petugas/pengguna untuk panel admin (mock).
export function useStaff() {
  return useQuery({ queryKey: ["admin", "staff"], queryFn: () => Promise.resolve(adminService.listStaff()) });
}

export function useVisitors() {
  return useQuery({ queryKey: ["admin", "visitors"], queryFn: () => Promise.resolve(adminService.listVisitors()) });
}
