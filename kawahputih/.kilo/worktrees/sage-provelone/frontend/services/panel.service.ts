import { mockApi } from "@/lib/mock/mock-client";
import {
  adminDashboardKpis,
  adminTotalPengunjung,
  ticketSales7Days,
  adminReportCards,
  staffRows,
  adminContentMenu,
  visitorRows,
  purchaseRows,
  paymentRows,
  bookingRows,
  bookingSummary,
  ticketTypes,
  managerDashboardKpis,
  managerTotalPengunjung,
  managerVisitorTrend,
  bestSellingTickets,
  recentActivities,
  managerSalesTickets,
  managerSalesDetail,
  managerSalesTotal,
  managerRevenueMonthly,
  managerRevenueByTicket,
  managerTotalRevenue,
  managerBookingList,
  visitorBreakdown,
  visitorBreakdownTotal,
  officerRows,
  officerTotals,
  validationPerHour,
  petugasKpis,
  scanHistory,
  petugasTicketDetail,
} from "@/lib/mock/data";

// ============================================================================
// PANEL SERVICE — SATU-SATUNYA titik akses data untuk panel Admin / Manager /
// Petugas.
//
// Halaman TIDAK lagi mengimpor `@/lib/mock/data` langsung. Ketika backend +
// database siap, cukup ubah fungsi `*Api` di bawah dari `mockApi` ke
// `axiosInstance`, contoh:
//
//   adminDashboardApi: () =>
//     axiosInstance.get<ApiResponse<AdminKpi[]>>("/admin/dashboard").then((r) => r.data),
//
// Bentuk data (`data` di dalam ApiResponse) sudah identik dengan tipe mock,
// sehingga komponen tidak perlu diubah.
// ============================================================================

export * from "@/lib/mock/data";

export const panelService = {
  // ---- Admin -------------------------------------------------------------
  adminDashboardApi: () => mockApi.get(adminDashboardKpis),
  adminTotalPengunjungApi: () => mockApi.get(adminTotalPengunjung),
  ticketSales7DaysApi: () => mockApi.get(ticketSales7Days),
  adminReportCardsApi: () => mockApi.get(adminReportCards),
  staffApi: () => mockApi.get(staffRows),
  adminContentApi: () => mockApi.get(adminContentMenu),
  visitorsApi: () => mockApi.get(visitorRows),
  purchasesApi: () => mockApi.get(purchaseRows),
  paymentsApi: () => mockApi.get(paymentRows),
  bookingsApi: () => mockApi.get(bookingRows),
  bookingSummaryApi: () => mockApi.get(bookingSummary),
  ticketTypesApi: () => mockApi.get(ticketTypes),

  // ---- Manager -----------------------------------------------------------
  managerDashboardApi: () => mockApi.get(managerDashboardKpis),
  managerVisitorsApi: () => mockApi.get(managerVisitorTrend),
  bestSellingApi: () => mockApi.get(bestSellingTickets),
  recentActivitiesApi: () => mockApi.get(recentActivities),
  managerSalesApi: () => mockApi.get(managerSalesTickets),
  managerSalesDetailApi: () => mockApi.get(managerSalesDetail),
  managerRevenueMonthlyApi: () => mockApi.get(managerRevenueMonthly),
  managerRevenueByTicketApi: () => mockApi.get(managerRevenueByTicket),
  managerBookingsApi: () => mockApi.get(managerBookingList),
  visitorBreakdownApi: () => mockApi.get(visitorBreakdown),
  officerRowsApi: () => mockApi.get(officerRows),
  officerTotalsApi: () => mockApi.get(officerTotals),
  validationPerHourApi: () => mockApi.get(validationPerHour),

  // ---- Petugas -----------------------------------------------------------
  petugasKpisApi: () => mockApi.get(petugasKpis),
  scanHistoryApi: () => mockApi.get(scanHistory),
  petugasTicketDetailApi: () => mockApi.get(petugasTicketDetail),
};

export { managerTotalPengunjung, managerSalesTotal, managerTotalRevenue, visitorBreakdownTotal };
