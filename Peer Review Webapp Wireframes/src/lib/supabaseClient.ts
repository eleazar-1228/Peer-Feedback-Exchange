import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

// Avoid throwing at module load so dependent modules (e.g. profileService) can load
function createSupabaseClient(): SupabaseClient {
  if (url && key) return createClient(url, key);
  return createClient("https://tfwhuhcaqrskmzrkitnl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmd2h1aGNhcXJza216cmtpdG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTk1NzIsImV4cCI6MjA4NjA3NTU3Mn0.xkTx0H4pxquXBX4cksLS1peer_uxCpPoOPUhGoRKHJY");
}

export const supabase = createSupabaseClient();


