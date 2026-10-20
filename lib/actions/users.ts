"use server";

import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAppUser } from "@/lib/db/mappers";
import { isFourDigitPin, toUserError } from "@/lib/validation";
import type { AppUserListItem, UserRole } from "@/lib/types";

export async function listAppUsers(): Promise<{ users: AppUserListItem[]; error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_users")
      .select("id, role, created_at")
      .order("created_at", { ascending: true });
    if (error || !data) {
      return { users: [], error: "UNABLE TO LOAD USERS." };
    }
    return { users: data.map(mapAppUser) };
  } catch (error) {
    return { users: [], error: toUserError(error, "UNABLE TO LOAD USERS.") };
  }
}

export async function createAppUser(pin: string, role: UserRole) {
  try {
    await requireAdmin();
    if (!isFourDigitPin(pin)) {
      return { error: "PASSWORD MUST BE 4 DIGITS." };
    }
    if (role !== "admin" && role !== "owner") {
      return { error: "INVALID USER ROLE." };
    }

    const admin = createAdminClient();
    const { data, error } = await admin.from("app_users").select("id, pin_hash");
    if (error || !data) {
      return { error: "UNABLE TO CREATE USER." };
    }

    for (const row of data as { pin_hash: string }[]) {
      const duplicate = await bcrypt.compare(pin, row.pin_hash);
      if (duplicate) {
        return { error: "THIS PASSWORD IS ALREADY IN USE." };
      }
    }

    const pinHash = await bcrypt.hash(pin, 12);
    const { error: insertError } = await admin.from("app_users").insert({
      pin_hash: pinHash,
      role,
    });
    if (insertError) {
      return { error: "UNABLE TO CREATE USER." };
    }
    return { success: true as const };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO CREATE USER.") };
  }
}

export async function deleteAppUser(userId: string) {
  try {
    const adminUser = await requireAdmin();
    if (userId === adminUser.id) {
      return { error: "YOU CANNOT DELETE YOUR OWN ACCESS." };
    }
    const admin = createAdminClient();
    const { error } = await admin.from("app_users").delete().eq("id", userId);
    if (error) {
      return { error: "UNABLE TO DELETE USER." };
    }
    return { success: true as const };
  } catch (error) {
    return { error: toUserError(error, "UNABLE TO DELETE USER.") };
  }
}
