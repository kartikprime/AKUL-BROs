export const DEFAULT_FIXED_FAT = 60;
export const DEFAULT_RATE = 54;
export const DEFAULT_FIXED_NUMBER = 0.015;

export type CycleNumber = 1 | 2 | 3;

export type CycleParameters = {
  fixedFat: number;
  rate: number;
  fixedNumber: number;
};

export const DEFAULT_CYCLE_PARAMETERS: CycleParameters = {
  fixedFat: DEFAULT_FIXED_FAT,
  rate: DEFAULT_RATE,
  fixedNumber: DEFAULT_FIXED_NUMBER,
};

/**
 * In/Out Wt = Fixed Number × (Fat − Fixed Fat) × Weight
 * The original sign is preserved. Do not use absolute value.
 */
export function calculateInOutWt(
  weight: number,
  fat: number,
  fixedFat: number,
  fixedNumber: number,
): number {
  return fixedNumber * (fat - fixedFat) * weight;
}

/** Final Wt = Weight + In/Out Wt (signed In/Out Wt used directly). */
export function calculateFinalWt(weight: number, inOutWt: number): number {
  return weight + inOutWt;
}

/** Amount = Final Wt × Rate */
export function calculateAmount(finalWt: number, rate: number): number {
  return finalWt * rate;
}

export type SummaryRowInput = {
  day: number;
  shift: "AM" | "PM";
  weight: number;
  fat: number;
};

export type SummaryRow = SummaryRowInput & {
  inOutWt: number;
  finalWt: number;
  amount: number;
};

export type SummaryTotals = {
  totalWeight: number;
  totalInOutWt: number;
  totalFinalWt: number;
  totalAmount: number;
};

export function calculateSummaryRow(
  row: SummaryRowInput,
  parameters: CycleParameters,
): SummaryRow {
  const inOutWt = calculateInOutWt(
    row.weight,
    row.fat,
    parameters.fixedFat,
    parameters.fixedNumber,
  );
  const finalWt = calculateFinalWt(row.weight, inOutWt);
  const amount = calculateAmount(finalWt, parameters.rate);
  return { ...row, inOutWt, finalWt, amount };
}

export function calculateSummary(
  rows: SummaryRowInput[],
  parameters: CycleParameters,
): { rows: SummaryRow[]; totals: SummaryTotals } {
  const calculated = rows.map((row) => calculateSummaryRow(row, parameters));
  const totals = calculated.reduce<SummaryTotals>(
    (acc, row) => ({
      totalWeight: acc.totalWeight + row.weight,
      totalInOutWt: acc.totalInOutWt + row.inOutWt,
      totalFinalWt: acc.totalFinalWt + row.finalWt,
      totalAmount: acc.totalAmount + row.amount,
    }),
    { totalWeight: 0, totalInOutWt: 0, totalFinalWt: 0, totalAmount: 0 },
  );
  return { rows: calculated, totals };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getCycleRange(
  cycle: CycleNumber,
  daysInMonth: number,
): { start: number; end: number } {
  if (cycle === 1) return { start: 1, end: 10 };
  if (cycle === 2) return { start: 11, end: 20 };
  return { start: 21, end: daysInMonth };
}
