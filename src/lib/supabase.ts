import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

function getSupabaseAdminKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAdminKey());
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const adminKey = getSupabaseAdminKey();

  if (!url || !adminKey) {
    return null;
  }

  return createClient(url, adminKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}
