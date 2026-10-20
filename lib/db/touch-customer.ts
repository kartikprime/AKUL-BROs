import { createUserClient } from "@/lib/supabase/server";

export async function touchCustomer(customerId: string) {
  const { supabase } = await createUserClient();
  await supabase
    .from("customers")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", customerId);
}
