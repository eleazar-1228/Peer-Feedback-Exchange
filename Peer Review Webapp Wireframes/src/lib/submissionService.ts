import { supabase } from "./supabaseClient";

export type FeedbackCategory =
  | "general"
  | "technical"
  | "presentation"
  | "contentStructure";

export type CreateSubmissionInput = {
  course: string;
  week: string; // "week1"..."week6"
  projectTeam: string;
  projectTitle: string;
  description?: string;
  projectDocumentUrl: string;
  feedbackCategories: FeedbackCategory[];
  dueDate: string; // "YYYY-MM-DD"
};

export async function createSubmission(input: CreateSubmissionInput) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      author_id: user.id,
      course: input.course,
      week: input.week,
      project_team: input.projectTeam,
      project_title: input.projectTitle,
      description: input.description ?? null,
      project_document_url: input.projectDocumentUrl,
      due_date: input.dueDate,
      feedback_categories: input.feedbackCategories, // requires this column (jsonb or text[])
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export type SubmissionRow = {
  id: string;
  author_id: string;
  course: string;
  week: string;
  project_team: string;
  project_title: string;
  description: string | null;
  project_document_url: string;
  due_date: string; // ISO date string
  status: string;
  created_at: string;
  feedback_categories?: FeedbackCategory[] | null;
};

export async function getMySubmissions() {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubmissionRow[];
}

export async function getAllSubmissions() {
  // Note: this will work only if your RLS allows it.
  // For now (dev), you can enable read for authenticated users, or later restrict to professor role.
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubmissionRow[];
}

export type SubmissionStatusFilter = "pending" | "reviewed";

export type GetAllSubmissionsParams = {
  course?: string;        // exact match (dropdown)
  teamName?: string;      // partial match (typing)
  status?: "Pending" | "Reviewed"; // UI values
  limit?: number;
  offset?: number;
};

export type SubmissionWithAuthor = SubmissionRow & {
  author?: {
    first_name: string | null;
    last_name: string | null;
    student_id: string | null;
  };
};

export async function getAllSubmissionsFiltered(params: GetAllSubmissionsParams = {}) {
  let q = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  // Exact course match (best for dropdown)
  if (params.course) {
    q = q.eq("course", params.course);
  }

  // Team name partial match (best for typing)
  if (params.teamName) {
    q = q.ilike("project_team", `%${params.teamName}%`);
  }

  // Status filter (map UI -> DB)
  if (params.status) {
    const dbStatus: SubmissionStatusFilter =
      params.status === "Pending" ? "pending" : "reviewed";
    q = q.eq("status", dbStatus);
  }

  // Pagination (optional)
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;
  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q;
  if (error) throw error;
  
  const submissions = (data ?? []) as SubmissionRow[];
  
  // Fetch author profiles separately - fetch one by one to avoid RLS issues
  if (submissions.length === 0) return [];
  
  const authorIds = [...new Set(submissions.map(s => s.author_id))]; // Remove duplicates
  console.log("Fetching profiles for author IDs:", authorIds);
  
  // DEBUG: Fetch ALL profiles to see what's in the table
  const { data: allProfiles, error: allProfilesError } = await supabase
    .from("profiles")
    .select("*");
  console.log("ALL PROFILES IN DATABASE:", allProfiles);
  console.log("ALL PROFILES ERROR:", allProfilesError);
  
  // Fetch profiles one by one to avoid potential query issues
  const profileMap = new Map();
  
  for (const authorId of authorIds) {
    try {
      console.log(`Attempting to fetch profile for author ID: ${authorId}`);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authorId)
        .maybeSingle();
      
      console.log(`Profile fetch result for ${authorId}:`, { profile, error });
      
      if (error) {
        console.error(`Error fetching profile for ${authorId}:`, error);
      } else if (profile) {
        console.log(`Successfully fetched profile:`, profile);
        profileMap.set(profile.id, profile);
      } else {
        console.warn(`No profile found for author ID: ${authorId}`);
      }
    } catch (e) {
      console.error(`Failed to fetch profile for ${authorId}:`, e);
    }
  }
  
  console.log("Final profile map:", profileMap);
  console.log("Profile map size:", profileMap.size);
  
  // Attach author info to submissions
  return submissions.map(s => ({
    ...s,
    author: profileMap.get(s.author_id),
  })) as SubmissionWithAuthor[];
}

export async function getDistinctCourses(): Promise<string[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("course")
    .order("course", { ascending: true });

  if (error) throw error;

  const courses = Array.from(new Set((data ?? []).map((r) => r.course))).filter(Boolean) as string[];
  return courses;
}
