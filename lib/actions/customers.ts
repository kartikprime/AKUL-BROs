"use server";

import { CUSTOMER_ID_START, parseRequiredName, toUserError } from "@/lib/validation";
import { throwQueryError } from "@/lib/db/errors";
import { mapCustomer, type CustomerRow } from "@/lib/db/mappers";
import { createUserClient } from "@/lib/supabase/server";
import type { Customer, CustomerSort } from "@/lib/types";

export async function listCustomers(
  villageId: string,
  sort: CustomerSort = "modified",
): Promise<{ customers: Customer[]; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const query = supabase.from("customers").select("*").eq("village_id", villageId);
    const { data, error } = await query;
    if (error) throwQueryError(error, "UNABLE TO LOAD CUSTOMERS.");
    const customers = ((data ?? []) as CustomerRow[]).map(mapCustomer);
    customers.sort((a, b) => {
      if (sort === "alpha") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return { customers };
  } catch (error) {
    return { customers: [], error: toUserError(error, "UNABLE TO LOAD CUSTOMERS.") };
  }
}

export async function getCustomer(customerId: string): Promise<{ customer: Customer | null; error?: string }> {
  try {
    const { supabase } = await createUserClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .maybeSingle();
    if (error) throwQueryError(error, "UNABLE TO LOAD CUSTOMER.");
    return { customer: data ? mapCustomer(data as CustomerRow) : null };
  } catch (error) {
    return { customer: null, error: toUserError(error, "UNABLE TO LOAD CUSTOMER.") };
  }
}

async function nextCustomerNumber(ownerId: string) {
  const { supabase } = await createUserClient();
  const { data, error } = await supabase
    .from("customers")
    .select("customer_number")
    .eq("owner_id", ownerId)
    .order("customer_number", { ascending: false })
    .limit(1);
  if (error) throwQueryError(error, "UNABLE TO ASSIGN CUSTOMER ID.");
  const current = data?.[0]?.customer_number as number | undefined;
  return current ? current + 1 : CUSTOMER_ID_START;
}

export async function createCustomer(input: { villageId: string; name: string }) {
  try {
    const name = parseRequiredName(input.name, "CUSTOMER NAME");
    const { user, supabase } = await createUserClient();

    const { data: village, error: villageError } = await supabase
      .from("villages")
      .select("id")
      .eq("id", input.villageId)
      .maybeSingle();
    if (villageError || !village) {
      return { error: "VILLAGE NOT FOUND." };
    }

    const customerNumber = await nextCustomerNumber(user.id);
    const { data, error } = await supabase
      .from("customers")
      .insert({
        owner_id: user.id,
        village_id: input.villageId,
        customer_number: customerNumber,
        name,
      })
      .select("*")
      .single();
    if (error) {
      throwQueryError(error, "UNABLE TO SAVE CUSTOMER.", "CUSTOMER ID MUST BE UNIQUE.");
    }
    return { customer: mapCustomer(data as CustomerRow) };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO SAVE CUSTOMER.") };
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const { supabase } = await createUserClient();
    const { error } = await supabase.from("customers").delete().eq("id", customerId);
    if (error) throwQueryError(error, "UNABLE TO DELETE CUSTOMER.");
    return { success: true as const };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO DELETE CUSTOMER.") };
  }
}
