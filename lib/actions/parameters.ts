"use server";

import {
  DEFAULT_CYCLE_PARAMETERS,
  type CycleNumber,
  type CycleParameters,
} from "@/lib/calculations";
import { throwQueryError } from "@/lib/db/errors";
import { mapCycleParameter, type CycleParameterRow } from "@/lib/db/mappers";
import { createUserClient } from "@/lib/supabase/server";
import { parseParameterNumber, toUserError } from "@/lib/validation";
import { touchCustomer } from "@/lib/db/touch-customer";

export async function getCycleParameters(
  customerId: string,
  cycle: CycleNumber,
): Promise<{ parameters: CycleParameters; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("cycle_parameters")
      .select("*")
      .eq("customer_id", customerId)
      .eq("cycle", cycle)
      .maybeSingle();
    if (error) throwQueryError(error, "UNABLE TO LOAD PARAMETERS.");
    if (!data) {
      return { parameters: DEFAULT_CYCLE_PARAMETERS };
    }
    const mapped = mapCycleParameter(data as CycleParameterRow);
    return {
      parameters: {
        fixedFat: mapped.fixedFat,
        rate: mapped.rate,
        fixedNumber: mapped.fixedNumber,
      },
    };
  } catch (error) {
    return {
      parameters: DEFAULT_CYCLE_PARAMETERS,
      error: toUserError(error, "UNABLE TO LOAD PARAMETERS."),
    };
  }
}

export async function saveCycleParameters(input: {
  customerId: string;
  cycle: CycleNumber;
  fixedFat: string | number;
  rate: string | number;
  fixedNumber: string | number;
}) {
  try {
    const fixedFat = parseParameterNumber(input.fixedFat, "FIXED FAT");
    const rate = parseParameterNumber(input.rate, "RATE");
    const fixedNumber = parseParameterNumber(input.fixedNumber, "FIXED NUMBER");
    const { user, supabase } = await createUserClient();
    const { error } = await supabase.from("cycle_parameters").upsert(
      {
        owner_id: user.id,
        customer_id: input.customerId,
        cycle: input.cycle,
        fixed_fat: fixedFat,
        rate,
        fixed_number: fixedNumber,
      },
      { onConflict: "customer_id,cycle" },
    );
    if (error) throwQueryError(error, "UNABLE TO SAVE PARAMETERS.");
    await touchCustomer(input.customerId);
    return { success: true as const, parameters: { fixedFat, rate, fixedNumber } };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO SAVE PARAMETERS.") };
  }
}
