"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { getInitialAdminPin } from "@/lib/supabase/env";
import { isFourDigitPin, toUserError } from "@/lib/validation";
import type { UserRole } from "@/lib/types";

type AppUserAuthRow = {
  id: string;
  pin_hash: string;
  role: UserRole;
};

async function ensureInitialAdmin() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("app_users").select("id").limit(1);
  if (error) {
    throw new Error("UNABLE TO CONNECT TO THE DATABASE.");
  }
  if (data && data.length > 0) return;

  const pin = getInitialAdminPin();
  if (!isFourDigitPin(pin)) {
    throw new Error("INITIAL ADMIN PIN IS NOT CONFIGURED.");
  }
  const pinHash = await bcrypt.hash(pin, 12);
  const { error: insertError } = await admin.from("app_users").insert({
    pin_hash: pinHash,
    role: "admin",
  });
  if (insertError) {
    throw new Error("UNABLE TO CREATE THE ADMIN USER.");
  }
}

export async function loginWithPin(pin: string) {
  try {
    if (!isFourDigitPin(pin)) {
      return { error: "ENTER A 4 DIGIT PASSWORD." };
    }

    await ensureInitialAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_users")
      .select("id, pin_hash, role");

    if (error || !data) {
      return { error: "UNABLE TO VERIFY PASSWORD." };
    }

    let matched: AppUserAuthRow | null = null;
    for (const row of data as AppUserAuthRow[]) {
      const ok = await bcrypt.compare(pin, row.pin_hash);
      if (ok) {
        matched = row;
        break;
      }
    }

    if (!matched) {
      return { error: "INVALID PASSWORD." };
    }

    await setSessionCookie({ id: matched.id, role: matched.role });
  } catch (error) {
    return { error: toUserError(error, "LOGIN FAILED.") };
  }

  redirect("/villages");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}
