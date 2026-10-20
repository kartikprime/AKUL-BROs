function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`MISSING ENVIRONMENT VARIABLE: ${name}`);
  }
  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getServiceRoleKey() {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function getJwtSecret() {
  return required("SUPABASE_JWT_SECRET");
}

export function getSessionSecret() {
  return required("SESSION_SECRET");
}

export function getInitialAdminPin() {
  return process.env.INITIAL_ADMIN_PIN ?? "";
}
