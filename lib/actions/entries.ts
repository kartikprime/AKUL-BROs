"use server";

import { throwQueryError } from "@/lib/db/errors";
import { mapDailyEntry, type DailyEntryRow } from "@/lib/db/mappers";
import { createUserClient } from "@/lib/supabase/server";
import { parseFat, parseWeight, toUserError } from "@/lib/validation";
import { touchCustomer } from "@/lib/db/touch-customer";
import type { DailyEntry, Shift } from "@/lib/types";

export async function listDailyEntries(input: {
  villageId: string;
  startDate: string;
  endDate: string;
}): Promise<{ entries: DailyEntry[]; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("village_id", input.villageId)
      .gte("entry_date", input.startDate)
      .lte("entry_date", input.endDate);
    if (error) throwQueryError(error, "UNABLE TO LOAD DAILY ENTRIES.");
    return { entries: ((data ?? []) as DailyEntryRow[]).map(mapDailyEntry) };
  } catch (error) {
    return { entries: [], error: toUserError(error, "UNABLE TO LOAD DAILY ENTRIES.") };
  }
}

export async function listCustomerEntries(input: {
  customerId: string;
  startDate: string;
  endDate: string;
}): Promise<{ entries: DailyEntry[]; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("customer_id", input.customerId)
      .gte("entry_date", input.startDate)
      .lte("entry_date", input.endDate)
      .order("entry_date", { ascending: true })
      .order("shift", { ascending: true });
    if (error) throwQueryError(error, "UNABLE TO LOAD CUSTOMER SUMMARY.");
    return { entries: ((data ?? []) as DailyEntryRow[]).map(mapDailyEntry) };
  } catch (error) {
    return { entries: [], error: toUserError(error, "UNABLE TO LOAD CUSTOMER SUMMARY.") };
  }
}

export async function saveDailyEntry(input: {
  villageId: string;
  customerId: string;
  customerNumber: number;
  customerName: string;
  entryDate: string;
  shift: Shift;
  weight: string;
  fat: string;
}) {
  try {
    const weight = parseWeight(input.weight);
    const fat = parseFat(input.fat);
    const { user, supabase } = await createUserClient();

    if (weight === null && fat === null) {
      const { error } = await supabase
        .from("daily_entries")
        .delete()
        .eq("customer_id", input.customerId)
        .eq("entry_date", input.entryDate)
        .eq("shift", input.shift);
      if (error) throwQueryError(error, "UNABLE TO UPDATE DAILY ENTRY.");
      await touchCustomer(input.customerId);
      return { deleted: true as const };
    }

    if (weight === null || fat === null) {
      return { error: "ENTER BOTH WEIGHT AND FAT." };
    }

    const { error } = await supabase.from("daily_entries").upsert(
      {
        owner_id: user.id,
        village_id: input.villageId,
        customer_id: input.customerId,
        customer_number: input.customerNumber,
        customer_name: input.customerName,
        entry_date: input.entryDate,
        shift: input.shift,
        weight,
        fat,
      },
      { onConflict: "customer_id,entry_date,shift" },
    );
    if (error) throwQueryError(error, "UNABLE TO SAVE DAILY ENTRY.");
    await touchCustomer(input.customerId);
    return { success: true as const };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO SAVE DAILY ENTRY.") };
  }
}
