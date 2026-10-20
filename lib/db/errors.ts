import { isUniqueViolation } from "@/lib/validation";

export function throwQueryError(error: unknown, fallback: string, uniqueMessage?: string): never {
  if (uniqueMessage && isUniqueViolation(error)) {
    throw new Error(uniqueMessage);
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String(error.message).toLowerCase();
    if (message.includes("fetch") || message.includes("network")) {
      throw new Error("NETWORK ERROR. PLEASE TRY AGAIN.");
    }
  }
  throw new Error(fallback);
}
