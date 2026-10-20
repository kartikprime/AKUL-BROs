import {
  calculateAmount,
  calculateFinalWt,
  calculateInOutWt,
  calculateSummary,
  getCycleRange,
  getDaysInMonth,
} from "@/lib/calculations";

function assertClose(actual: number, expected: number, label: string) {
  if (Math.abs(actual - expected) > 1e-9) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

export function runCalculationChecks() {
  const inOut = calculateInOutWt(31.3, 59, 60, 0.015);
  assertClose(inOut, 0.015 * (59 - 60) * 31.3, "in/out wt");

  const finalWt = calculateFinalWt(31.3, inOut);
  assertClose(finalWt, 31.3 + inOut, "final wt");

  const amount = calculateAmount(finalWt, 54);
  assertClose(amount, finalWt * 54, "amount");

  const positiveInOut = calculateInOutWt(6, 80, 60, 0.015);
  assertClose(positiveInOut, 0.015 * (80 - 60) * 6, "positive in/out wt");
  assertClose(calculateFinalWt(6, positiveInOut), 6 + positiveInOut, "positive final wt");

  const { totals } = calculateSummary(
    [
      { day: 1, shift: "AM", weight: 31.3, fat: 59 },
      { day: 1, shift: "PM", weight: 6, fat: 80 },
    ],
    { fixedFat: 60, rate: 54, fixedNumber: 0.015 },
  );
  assertClose(totals.totalInOutWt, inOut + positiveInOut, "algebraic total in/out");

  if (getDaysInMonth(2026, 2) !== 28) throw new Error("february 2026 should have 28 days");
  if (getCycleRange(3, 31).end !== 31) throw new Error("cycle 3 should end on day 31");
  if (getCycleRange(3, 30).end !== 30) throw new Error("cycle 3 should end on day 30");
}
