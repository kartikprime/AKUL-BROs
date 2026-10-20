"use client";

import { useState, useTransition } from "react";
import { listCustomerEntries } from "@/lib/actions/entries";
import { getCycleParameters, saveCycleParameters } from "@/lib/actions/parameters";
import { ErrorBanner } from "@/components/error-banner";
import { LoadingState } from "@/components/loading-state";
import { MonthPicker } from "@/components/month-picker";
import {
  calculateSummary,
  getCycleRange,
  getDaysInMonth,
  type CycleNumber,
  type CycleParameters,
} from "@/lib/calculations";
import {
  formatAmount,
  formatCustomerLabel,
  formatDecimal,
  formatMonthLabel,
  formatSignedDecimal,
  toDateString,
} from "@/lib/format";
import type { Customer, DailyEntry, Village } from "@/lib/types";

const CYCLES: CycleNumber[] = [1, 2, 3];

function cycleLabel(cycle: CycleNumber, days: number) {
  const range = getCycleRange(cycle, days);
  return `CYCLE ${cycle} (${range.start}–${range.end})`;
}

function dayFromDate(date: string) {
  return Number(date.slice(8, 10));
}

function buildSummary(entries: DailyEntry[], parameters: CycleParameters, cycle: CycleNumber, days: number) {
  const range = getCycleRange(cycle, days);
  const rows = entries
    .filter((entry) => {
      const day = dayFromDate(entry.entryDate);
      return day >= range.start && day <= range.end;
    })
    .map((entry) => ({
      day: dayFromDate(entry.entryDate),
      shift: entry.shift,
      weight: entry.weight,
      fat: entry.fat,
    }));
  return calculateSummary(rows, parameters);
}

export function CustomerSummary({
  village,
  customer,
  initialYear,
  initialMonth,
  initialEntries,
  initialParameters,
}: {
  village: Village;
  customer: Customer;
  initialYear: number;
  initialMonth: number;
  initialEntries: DailyEntry[];
  initialParameters: CycleParameters;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [cycle, setCycle] = useState<CycleNumber>(1);
  const [entries, setEntries] = useState(initialEntries);
  const [parameters, setParameters] = useState(initialParameters);
  const [fixedFat, setFixedFat] = useState(String(initialParameters.fixedFat));
  const [rate, setRate] = useState(String(initialParameters.rate));
  const [fixedNumber, setFixedNumber] = useState(String(initialParameters.fixedNumber));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const days = getDaysInMonth(year, month);
  const summary = buildSummary(entries, parameters, cycle, days);

  function applyParameters(next: CycleParameters) {
    setParameters(next);
    setFixedFat(String(next.fixedFat));
    setRate(String(next.rate));
    setFixedNumber(String(next.fixedNumber));
  }

  function loadSummaryData(nextYear: number, nextMonth: number, nextCycle: CycleNumber) {
    setLoading(true);
    setError(null);
    const startDate = toDateString(nextYear, nextMonth, 1);
    const endDate = toDateString(nextYear, nextMonth, getDaysInMonth(nextYear, nextMonth));
    startTransition(async () => {
      const [entryResult, paramResult] = await Promise.all([
        listCustomerEntries({ customerId: customer.id, startDate, endDate }),
        getCycleParameters(customer.id, nextCycle),
      ]);
      if (entryResult.error) setError(entryResult.error);
      if (paramResult.error) setError(paramResult.error);
      setEntries(entryResult.entries);
      applyParameters(paramResult.parameters);
      setLoading(false);
    });
  }

  function persist(next: CycleParameters) {
    startTransition(async () => {
      const result = await saveCycleParameters({
        customerId: customer.id,
        cycle,
        fixedFat: next.fixedFat,
        rate: next.rate,
        fixedNumber: next.fixedNumber,
      });
      if (result.error) setError(result.error);
    });
  }

  function commitParameters() {
    setError(null);
    const next: CycleParameters = {
      fixedFat: Number(fixedFat),
      rate: Number(rate),
      fixedNumber: Number(fixedNumber),
    };
    if (![next.fixedFat, next.rate, next.fixedNumber].every(Number.isFinite)) {
      setError("FIXED FAT, RATE, AND FIXED NUMBER MUST BE VALID NUMBERS.");
      return;
    }
    setParameters(next);
    persist(next);
  }

  function signedClass(value: number) {
    if (value < 0) return "negative";
    if (value > 0) return "positive";
    return "";
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <p className="label-text">{village.name}</p>
        <h2 className="section-heading mt-1">
          {formatCustomerLabel(customer.customerNumber, customer.name)}
        </h2>
        <p className="mt-2 text-[13px] text-[var(--color-muted)]">
          {formatMonthLabel(year, month)} · {cycleLabel(cycle, days)}
        </p>
      </div>

      <MonthPicker
        year={year}
        month={month}
        onChange={(nextYear, nextMonth) => {
          setYear(nextYear);
          setMonth(nextMonth);
          loadSummaryData(nextYear, nextMonth, cycle);
        }}
      />

      <div className="grid grid-cols-3 gap-2">
        {CYCLES.map((item) => (
          <button
            key={item}
            type="button"
            className={`btn min-h-16 rounded-2xl px-2 text-center text-[12px] leading-tight ${
              cycle === item ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => {
              setCycle(item);
              loadSummaryData(year, month, item);
            }}
          >
            {cycleLabel(item, days)}
          </button>
        ))}
      </div>

      <section className="card p-4">
        <h3 className="section-heading mb-4">PARAMETERS</h3>
        <div className="grid gap-3">
          <label className="block">
            <span className="label-text mb-2 block">FIXED FAT</span>
            <input
              className="field"
              inputMode="decimal"
              value={fixedFat}
              onChange={(event) => {
                setFixedFat(event.target.value);
                const numeric = Number(event.target.value);
                if (Number.isFinite(numeric)) {
                  setParameters({ ...parameters, fixedFat: numeric });
                }
              }}
              onBlur={commitParameters}
            />
          </label>
          <label className="block">
            <span className="label-text mb-2 block">RATE</span>
            <input
              className="field"
              inputMode="decimal"
              value={rate}
              onChange={(event) => {
                setRate(event.target.value);
                const numeric = Number(event.target.value);
                if (Number.isFinite(numeric)) {
                  setParameters({ ...parameters, rate: numeric });
                }
              }}
              onBlur={commitParameters}
            />
          </label>
          <label className="block">
            <span className="label-text mb-2 block">FIXED NUMBER</span>
            <input
              className="field"
              inputMode="decimal"
              value={fixedNumber}
              onChange={(event) => {
                setFixedNumber(event.target.value);
                const numeric = Number(event.target.value);
                if (Number.isFinite(numeric)) {
                  setParameters({ ...parameters, fixedNumber: numeric });
                }
              }}
              onBlur={commitParameters}
            />
          </label>
        </div>
        {pending ? <p className="label-text mt-3">SAVING PARAMETERS...</p> : null}
      </section>

      <ErrorBanner message={error} />
      {loading ? <LoadingState label="LOADING CUSTOMER SUMMARY" /> : null}

      <section className="card overflow-hidden">
        <div className="table-wrap">
          <table className="min-w-[720px] w-full text-left">
            <thead>
              <tr className="text-[11px] font-medium text-[var(--color-muted)]">
                <th className="px-3 py-3">DAY</th>
                <th className="px-3 py-3">SHIFT</th>
                <th className="px-3 py-3">WEIGHT</th>
                <th className="px-3 py-3">FAT</th>
                <th className="px-3 py-3">IN/OUT WT</th>
                <th className="px-3 py-3">FINAL WT</th>
                <th className="px-3 py-3">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="total-row text-[14px] font-bold">
                <td className="px-3 py-3" colSpan={2}>
                  TOTAL
                </td>
                <td className="px-3 py-3 tabular">{formatDecimal(summary.totals.totalWeight)}</td>
                <td className="px-3 py-3">—</td>
                <td className="px-3 py-3 tabular">{formatSignedDecimal(summary.totals.totalInOutWt)}</td>
                <td className="px-3 py-3 tabular">{formatDecimal(summary.totals.totalFinalWt)}</td>
                <td className="px-3 py-3 tabular">{formatAmount(summary.totals.totalAmount)}</td>
              </tr>
              {summary.rows.map((row) => (
                <tr key={`${row.day}-${row.shift}`} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-3 tabular">{row.day}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        row.shift === "AM" ? "shift-am" : "shift-pm"
                      }`}
                    >
                      {row.shift}
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular">{formatDecimal(row.weight)}</td>
                  <td className="px-3 py-3 tabular">{formatDecimal(row.fat)}</td>
                  <td className={`px-3 py-3 tabular ${signedClass(row.inOutWt)}`}>
                    {formatSignedDecimal(row.inOutWt)}
                  </td>
                  <td className="px-3 py-3 tabular">{formatDecimal(row.finalWt)}</td>
                  <td className={`px-3 py-3 tabular value-strong ${signedClass(row.amount)}`}>
                    {formatAmount(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary.rows.length === 0 && !loading ? (
          <p className="px-4 py-6 text-center text-[13px] text-[var(--color-muted)]">
            NO DAILY ENTRIES IN THIS CYCLE
          </p>
        ) : null}
      </section>
    </div>
  );
}
