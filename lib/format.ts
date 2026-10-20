export function formatCustomerLabel(customerNumber: number, name: string): string {
  return `${customerNumber} ${name}`;
}

export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function formatSignedDecimal(value: number, digits = 2): string {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0) || rounded === 0) {
    return (0).toFixed(digits);
  }
  if (rounded > 0) {
    return `+${rounded.toFixed(digits)}`;
  }
  return rounded.toFixed(digits);
}

export function formatAmount(value: number): string {
  const factor = 100;
  const rounded = Math.round(value * factor) / factor;
  const prefix = rounded < 0 ? "-₹" : "₹";
  return `${prefix}${Math.abs(rounded).toFixed(2)}`;
}

export function formatMonthLabel(year: number, month: number): string {
  const label = new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  return label;
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function toDateString(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
