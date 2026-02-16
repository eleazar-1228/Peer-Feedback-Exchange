import { supabase } from "./supabaseClient";

export type ProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  student_id: string | null;
  email: string | null;
  course: string | null;
  role: string | null;
};

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

export type UpdateProfileInput = {
  first_name?: string;
  last_name?: string;
  student_id?: string;
  email?: string;
  course?: string;
};

async function updateMyProfile(input: UpdateProfileInput): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id);

  if (error) throw error;
}

export { getMyProfile, updateMyProfile };
