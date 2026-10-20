"use server";

import { createUserClient } from "@/lib/supabase/server";
import { throwQueryError } from "@/lib/db/errors";
import { mapVillage, type VillageRow } from "@/lib/db/mappers";
import { parseRequiredName, parseVillageCode, toUserError } from "@/lib/validation";
import type { Village } from "@/lib/types";

export async function listVillages(): Promise<{ villages: Village[]; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throwQueryError(error, "UNABLE TO LOAD VILLAGES.");
    return { villages: ((data ?? []) as VillageRow[]).map(mapVillage) };
  } catch (error) {
    return { villages: [], error: toUserError(error, "UNABLE TO LOAD VILLAGES.") };
  }
}

export async function getVillage(villageId: string): Promise<{ village: Village | null; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .eq("id", villageId)
      .maybeSingle();
    if (error) throwQueryError(error, "UNABLE TO LOAD VILLAGE.");
    return { village: data ? mapVillage(data as VillageRow) : null };
  } catch (error) {
    return { village: null, error: toUserError(error, "UNABLE TO LOAD VILLAGE.") };
  }
}

export async function createVillage(input: { name: string; code: string }) {
  try {
    const name = parseRequiredName(input.name, "VILLAGE NAME");
    const code = parseVillageCode(input.code);
    const { user, supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("villages")
      .insert({ owner_id: user.id, name, code })
      .select("*")
      .single();
    if (error) {
      throwQueryError(error, "UNABLE TO SAVE VILLAGE.", "VILLAGE CODE MUST BE UNIQUE.");
    }
    return { village: mapVillage(data as VillageRow) };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO SAVE VILLAGE.") };
  }
}

export async function deleteVillage(villageId: string) {
  try {
    const { supabase } = await createUserClient();
    const { error } = await supabase.from("villages").delete().eq("id", villageId);
    if (error) throwQueryError(error, "UNABLE TO DELETE VILLAGE.");
    return { success: true as const };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO DELETE VILLAGE.") };
  }
}
