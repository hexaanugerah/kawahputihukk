// These services correspond to backend modules that don't exist yet
// (Review, Event, Weather, Analytics, Notification — see the original
// backend roadmap's Fase 3-5). Each function throws immediately with a
// clear message rather than silently returning empty data or hitting a
// 404 — so a component that accidentally calls one of these fails loudly
// during development instead of shipping a broken "loading forever" UI.
function notImplemented(name: string): never {
  throw new Error(`${name} service: backend module not implemented yet`);
}

export const reviewService = {
  list: () => notImplemented("review"),
  create: () => notImplemented("review"),
};

export const eventService = {
  list: () => notImplemented("event"),
};

export const weatherService = {
  current: () => notImplemented("weather"),
};

export const analyticsService = {
  dashboard: () => notImplemented("analytics"),
};

export const notificationService = {
  list: () => notImplemented("notification"),
};

export const paymentService = {
  // Payment is actually handled through booking.service.ts's create() call
  // (which returns a Midtrans redirect_url) and the backend's webhook —
  // there is no separate /payments CRUD endpoint to call from the
  // frontend. This stub exists only so the file matches Part 2.3's listed
  // structure; real payment logic lives in booking.service.ts.
  redirectToPaymentFromBooking: (redirectUrl: string) => {
    window.location.href = redirectUrl;
  },
};
