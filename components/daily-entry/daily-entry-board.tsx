"use client";

import { useState, useTransition } from "react";
import { listDailyEntries, saveDailyEntry } from "@/lib/actions/entries";
import { ErrorBanner } from "@/components/error-banner";
import { LoadingState } from "@/components/loading-state";
import { MonthPicker } from "@/components/month-picker";
import { getDaysInMonth } from "@/lib/calculations";
import { formatCustomerLabel, toDateString } from "@/lib/format";
import type { Customer, DailyEntry, Shift, Village } from "@/lib/types";

type Draft = {
  weight: string;
  fat: string;
};

function entryKey(customerId: string, date: string, shift: Shift) {
  return `${customerId}:${date}:${shift}`;
}

function draftsFromEntries(entries: DailyEntry[]): Record<string, Draft> {
  const next: Record<string, Draft> = {};
  for (const entry of entries) {
    next[entryKey(entry.customerId, entry.entryDate, entry.shift)] = {
      weight: String(entry.weight),
      fat: String(entry.fat),
    };
  }
  return next;
}

function buildDayCards(year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const cards: { day: number; shift: Shift; date: string }[] = [];
  for (let day = 1; day <= days; day += 1) {
    const date = toDateString(year, month, day);
    cards.push({ day, shift: "AM", date });
    cards.push({ day, shift: "PM", date });
  }
  return cards;
}

export function DailyEntryBoard({
  village,
  customers,
  initialYear,
  initialMonth,
  initialEntries,
}: {
  village: Village;
  customers: Customer[];
  initialYear: number;
  initialMonth: number;
  initialEntries: DailyEntry[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [drafts, setDrafts] = useState(() => draftsFromEntries(initialEntries));
  const [error, setError] = useState<string | null>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const dayCards = buildDayCards(year, month);

  function updateDraft(key: string, field: keyof Draft, value: string) {
    setDrafts((current) => ({
      ...current,
      [key]: {
        weight: current[key]?.weight ?? "",
        fat: current[key]?.fat ?? "",
        [field]: value,
      },
    }));
  }

  function persist(customer: Customer, date: string, shift: Shift, draft: Draft) {
    setSaving(true);
    startTransition(async () => {
      setError(null);
      const result = await saveDailyEntry({
        villageId: village.id,
        customerId: customer.id,
        customerNumber: customer.customerNumber,
        customerName: customer.name,
        entryDate: date,
        shift,
        weight: draft.weight,
        fat: draft.fat,
      });
      if (result.error) setError(result.error);
      setSaving(false);
    });
  }

  function changeMonth(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
    setLoadingMonth(true);
    setError(null);
    const startDate = toDateString(nextYear, nextMonth, 1);
    const endDate = toDateString(nextYear, nextMonth, getDaysInMonth(nextYear, nextMonth));
    startTransition(async () => {
      const result = await listDailyEntries({ villageId: village.id, startDate, endDate });
      if (result.error) setError(result.error);
      setDrafts(draftsFromEntries(result.entries));
      setLoadingMonth(false);
    });
  }

  return (
    <div className="space-y-4">
      <MonthPicker year={year} month={month} onChange={changeMonth} />
      <ErrorBanner message={error} />
      {saving || pending ? <p className="label-text">SAVING...</p> : null}
      {customers.length === 0 ? (
        <div className="card px-4 py-8 text-center text-[var(--color-muted)]">
          ADD CUSTOMERS BEFORE DAILY ENTRY
        </div>
      ) : loadingMonth ? (
        <LoadingState label="LOADING DAILY ENTRIES" />
      ) : (
        dayCards.map((card) => (
          <article key={`${card.date}-${card.shift}`} className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <h2 className="section-heading">
                DAY {card.day}, {card.shift} SHIFT
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                  card.shift === "AM" ? "shift-am" : "shift-pm"
                }`}
              >
                {card.shift}
              </span>
            </div>
            <div className="table-wrap">
              <table className="min-w-[560px] w-full border-t border-[var(--color-border)] text-left">
                <thead>
                  <tr className="text-[11px] font-medium text-[var(--color-muted)]">
                    <th className="px-3 py-2">CUSTOMER ID</th>
                    <th className="px-3 py-2">CUSTOMER NAME</th>
                    <th className="px-3 py-2">WEIGHT</th>
                    <th className="px-3 py-2">FAT</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const key = entryKey(customer.id, card.date, card.shift);
                    const draft = drafts[key] ?? { weight: "", fat: "" };
                    return (
                      <tr key={customer.id} className="border-t border-[var(--color-border)]">
                        <td className="px-3 py-2 font-semibold tabular">{customer.customerNumber}</td>
                        <td className="px-3 py-2">
                          {formatCustomerLabel(customer.customerNumber, customer.name)}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="field min-h-12 w-24 px-2"
                            inputMode="decimal"
                            value={draft.weight}
                            onChange={(event) => updateDraft(key, "weight", event.target.value)}
                            onBlur={(event) =>
                              persist(customer, card.date, card.shift, {
                                weight: event.target.value,
                                fat: draft.fat,
                              })
                            }
                            aria-label={`WEIGHT ${customer.customerNumber} ${card.shift}`}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            className="field min-h-12 w-24 px-2"
                            inputMode="decimal"
                            value={draft.fat}
                            onChange={(event) => updateDraft(key, "fat", event.target.value)}
                            onBlur={(event) =>
                              persist(customer, card.date, card.shift, {
                                weight: draft.weight,
                                fat: event.target.value,
                              })
                            }
                            aria-label={`FAT ${customer.customerNumber} ${card.shift}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
