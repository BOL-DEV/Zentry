export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function percent(sold: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return clampPercent(Math.round((sold / total) * 100));
}

export function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

export function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString()}`;
  }
}
