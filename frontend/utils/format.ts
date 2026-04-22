export function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatScore(value: number, digits = 1) {
  return `${value.toFixed(digits)}/10`;
}

export function formatConfidence(value: number) {
  return `${Math.round(value)}%`;
}

export function formatCurrency(value: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-KE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
