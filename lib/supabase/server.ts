import { createClient } from "@supabase/supabase-js";
import { createSupabaseAccessToken } from "@/lib/auth/jwt";
import { requireSessionUser } from "@/lib/auth/session";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import type { SessionUser } from "@/lib/types";

export async function createUserClient(user?: SessionUser) {
  const sessionUser = user ?? (await requireSessionUser());
  const { url, publishableKey } = getPublicSupabaseEnv();
  const accessToken = await createSupabaseAccessToken(sessionUser.id);

  return {
    user: sessionUser,
    supabase: createClient(url, publishableKey, {
      accessToken: async () => accessToken,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  };
}
