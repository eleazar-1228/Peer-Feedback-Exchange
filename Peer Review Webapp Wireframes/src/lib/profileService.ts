import { supabase } from "./supabaseClient";

async function getMyProfile(): Promise<Record<string, unknown> | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data as Record<string, unknown> | null;
}

export { getMyProfile };
