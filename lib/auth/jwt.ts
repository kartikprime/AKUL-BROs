import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret, getSessionSecret } from "@/lib/supabase/env";
import type { SessionUser } from "@/lib/types";

const SESSION_COOKIE = "akul_bros_session";

function secretKey(value: string) {
  return new TextEncoder().encode(value);
}

export { SESSION_COOKIE };

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey(getSessionSecret()));
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(getSessionSecret()));
    const id = payload.sub;
    const role = payload.role;
    if (!id || (role !== "admin" && role !== "owner")) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export async function createSupabaseAccessToken(userId: string): Promise<string> {
  return new SignJWT({
    aud: "authenticated",
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("supabase")
    .setAudience("authenticated")
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey(getJwtSecret()));
}
