// Amounts from the backend are always integer cents (see the backend's
// price_cents / unit_cents fields) — never floats — so formatting always
// divides by 100 here, in exactly one place, rather than at each call site.
export function formatCurrency(cents: number, currency = "IDR"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
