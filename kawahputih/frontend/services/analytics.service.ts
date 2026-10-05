import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "@/lib/api";

// ============================================================================
// ANALYTICS SERVICE — endpoint nyata di backend (mode demo, tanpa database).
//
//   GET /analytics/overview   (admin, super_admin, manager)
//   GET /analytics/visitors   (admin, super_admin, manager)
//
// Backend demo mengembalikan angka yang sudah diselaraskan dengan wireframe,
// sehingga panel bisa menampilkan data backend asli ketika token tersedia.
// ============================================================================

export interface WeeklyPoint {
  date: string;
  label: string;
  visitors: number;
  tickets: number;
  revenue_cents: number;
}

export interface ActivityItem {
  time: string;
  activity: string;
  description: string;
  status: string;
}

export interface TopPackage {
  name: string;
  tickets: number;
}

export interface StaffActivity {
  name: string;
  scans: number;
  last_active: string;
  status: string;
}

export interface AnalyticsOverview {
  total_visitors: number;
  tickets_sold: number;
  total_bookings: number;
  total_revenue_cents: number;
  bookings_today: number;
  visitors_today: number;
  checked_in_today: number;
  unused_today: number;
  problem_tickets: number;
  weekly: WeeklyPoint[];
  activities: ActivityItem[];
  top_packages: TopPackage[];
  staff: StaffActivity[];
  period: string;
}

export const analyticsService = {
  overview: () =>
    axiosInstance.get<ApiResponse<AnalyticsOverview>>("/analytics/overview").then((r) => r.data.data),

  visitors: () =>
    axiosInstance.get<ApiResponse<AnalyticsOverview>>("/analytics/visitors").then((r) => r.data.data),
};
