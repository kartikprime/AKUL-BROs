export const FAT_MIN = 0;
export const FAT_MAX = 400;
export const CUSTOMER_ID_START = 1001;

export function isFourDigitPin(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function parseRequiredName(value: string, fieldLabel: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldLabel} IS REQUIRED.`);
  }
  return trimmed;
}

export function parseVillageCode(value: string): string {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) {
    throw new Error("VILLAGE CODE IS REQUIRED.");
  }
  return trimmed;
}

export function parseWeight(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("WEIGHT MUST BE A VALID NUMBER.");
  }
  if (numeric < 0) {
    throw new Error("WEIGHT MUST BE A VALID MILK QUANTITY.");
  }
  return numeric;
}

export function parseFat(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("FAT MUST BE A VALID NUMBER.");
  }
  if (numeric < FAT_MIN || numeric > FAT_MAX) {
    throw new Error("FAT MUST BE BETWEEN 0 AND 400.");
  }
  return numeric;
}

export function parseParameterNumber(value: string | number, fieldLabel: string): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${fieldLabel} MUST BE A VALID NUMBER.`);
  }
  return numeric;
}

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? String(error.code) : "";
  return code === "23505";
}

export function toUserError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message.toUpperCase();
  }
  return fallback.toUpperCase();
}
