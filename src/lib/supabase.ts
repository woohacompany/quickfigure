import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase 프로젝트 URL (public, not secret)
const SUPABASE_URL = "https://ahvdfhgfifyoddweagln.supabase.co";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 디버그용 (확인 후 제거)
    console.log("[Supabase] URL:", SUPABASE_URL);
    console.log("[Supabase] Key defined:", !!key, "Key length:", key?.length);

    if (!key) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
    }
    _supabase = createClient(SUPABASE_URL, key);
  }
  return _supabase;
}
