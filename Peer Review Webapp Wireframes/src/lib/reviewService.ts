// src/lib/reviewService.ts
import { supabase } from "./supabaseClient";

export type ReviewStatus = "draft" | "submitted";

export type ReviewRow = {
  id: string;
  submission_id: string;
  reviewer_id: string;
  status: ReviewStatus;

  overall_rating: number | null;

  clarity: number | null;
  organization: number | null;
  technical_soundness: number | null;
  usability: number | null;

  strengths: string | null;
  improvements: string | null;
  one_change: string | null;
  other_observations: string | null;

  created_at: string;
  updated_at: string | null;
  submitted_at: string | null;
};

export type SaveReviewInput = {
  overallRating: number | null;
  clarity: number | null;
  organization: number | null;
  technicalSoundness: number | null;
  usability: number | null;

  strengths: string;
  improvements: string;
  oneChange: string;
  otherObservations: string;
};

export type ReviewableSubmission = {
  id: string;

  project_title: string;
  course: string;
  week: string;
  project_team: string;

  project_document_url: string;
  due_date: string;
  created_at: string;

  status: string; // submissions.status (pending/reviewed/etc)
};

async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

/**
 * Submissions the current user can review:
 * - not authored by the current user
 * - (optional) exclude ones already submitted by this user
 *
 * NOTE: This is implemented with 2 queries (simple + reliable without SQL RPC).
 */
export async function getReviewableSubmissions(): Promise<ReviewableSubmission[]> {
  const user = await requireUser();

  // 1) Get all submissions not authored by me
  const { data: subs, error: subsErr } = await supabase
    .from("submissions")
    .select("id, project_title, course, week, project_team, project_document_url, due_date, created_at, status, author_id")
    .neq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (subsErr) throw subsErr;
  const submissions = (subs ?? []) as any[];

  if (submissions.length === 0) return [];

  // 2) Find which of these already have a SUBMITTED review by me
  const submissionIds = submissions.map(s => s.id);

  const { data: mySubmittedReviews, error: revErr } = await supabase
    .from("reviews")
    .select("submission_id")
    .eq("reviewer_id", user.id)
    .eq("status", "submitted")
    .in("submission_id", submissionIds);

  if (revErr) throw revErr;

  const submittedSet = new Set((mySubmittedReviews ?? []).map(r => r.submission_id));

  // 3) Return only those not yet submitted by me
  return submissions
    .filter(s => !submittedSet.has(s.id))
    .map((s) => ({
      id: s.id,
      project_title: s.project_title,
      course: s.course,
      week: s.week,
      project_team: s.project_team,
      project_document_url: s.project_document_url,
      due_date: s.due_date,
      created_at: s.created_at,
      status: s.status,
    }));
}

/**
 * Fetch my existing draft/submitted review for a submission (if any).
 * This enables "resume draft" behavior.
 */
export async function getMyReviewForSubmission(submissionId: string): Promise<ReviewRow | null> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("submission_id", submissionId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ReviewRow | null;
}

/**
 * Save a draft review (upsert).
 * This will create the row if missing, or update if it exists.
 */
export async function saveDraftReview(submissionId: string, input: SaveReviewInput): Promise<ReviewRow> {
  const user = await requireUser();

  const payload = {
    submission_id: submissionId,
    reviewer_id: user.id,
    status: "draft" as const,

    overall_rating: input.overallRating,

    clarity: input.clarity,
    organization: input.organization,
    technical_soundness: input.technicalSoundness,
    usability: input.usability,

    strengths: input.strengths?.trim() ? input.strengths.trim() : null,
    improvements: input.improvements?.trim() ? input.improvements.trim() : null,
    one_change: input.oneChange?.trim() ? input.oneChange.trim() : null,
    other_observations: input.otherObservations?.trim() ? input.otherObservations.trim() : null,
  };

  const { data, error } = await supabase
    .from("reviews")
    .upsert(payload, { onConflict: "submission_id,reviewer_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as ReviewRow;
}

/**
 * Submit a review (upsert + status=submitted).
 * We also set submitted_at here (DB trigger can also do this; harmless to send too).
 */
export async function submitReview(submissionId: string, input: SaveReviewInput): Promise<ReviewRow> {
  const user = await requireUser();

  const payload = {
    submission_id: submissionId,
    reviewer_id: user.id,
    status: "submitted" as const,

    overall_rating: input.overallRating,

    clarity: input.clarity,
    organization: input.organization,
    technical_soundness: input.technicalSoundness,
    usability: input.usability,

    strengths: input.strengths?.trim() ? input.strengths.trim() : null,
    improvements: input.improvements?.trim() ? input.improvements.trim() : null,
    one_change: input.oneChange?.trim() ? input.oneChange.trim() : null,
    other_observations: input.otherObservations?.trim() ? input.otherObservations.trim() : null,

    submitted_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("reviews")
    .upsert(payload, { onConflict: "submission_id,reviewer_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as ReviewRow;
}

export type ReviewDisplayRow = {
  id: string;
  reviewerName: string;

  overallRating: number;
  clarity: number | null;
  organization: number | null;
  technicalSoundness: number | null;
  usability: number | null;

  strengths: string | null;
  improvements: string | null;
  oneChange: string | null;
  otherObservations: string | null;
};

//Delete later
export type ReviewWithReviewer = ReviewRow & {
  reviewer?: Array<{
    first_name: string | null;
    last_name: string | null;
    student_id: string | null;
  }>;
};

export async function getSubmittedReviewsForSubmission(submissionId: string): Promise<ReviewDisplayRow[]> {
    await requireUser();

    const { data, error } = await supabase
        .from("reviews")
        .select(`
        id,
        submission_id,
        reviewer_id,
        status,
        overall_rating,
        clarity,
        organization,
        technical_soundness,
        usability,
        strengths,
        improvements,
        one_change,
        other_observations,
        created_at,
        updated_at,
        submitted_at,
        reviewer:profiles(first_name,last_name,student_id)
        `)
        .eq("submission_id", submissionId)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as any[];

    return rows.map((review) => {

        // ✅ THIS is where your snippet goes
        const p = review.reviewer?.[0];
        const reviewerName =
        p
            ? (`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
                || p.student_id
                || "Anonymous")
            : "Anonymous";

        // Convert DB row → UI object
        return {
        id: review.id,
        reviewerName,

        overallRating: review.overall_rating ?? 0,
        clarity: review.clarity,
        organization: review.organization,
        technicalSoundness: review.technical_soundness,
        usability: review.usability,

        strengths: review.strengths,
        improvements: review.improvements,
        oneChange: review.one_change,
        otherObservations: review.other_observations,
        };
    });
}

/**
 * Get the count of submitted reviews for multiple submissions.
 * Returns a map of submission_id -> count.
 */
export async function getReviewCountsForSubmissions(submissionIds: string[]): Promise<Record<string, number>> {
  if (submissionIds.length === 0) return {};

  const { data, error } = await supabase
    .from("reviews")
    .select("submission_id")
    .eq("status", "submitted")
    .in("submission_id", submissionIds);

  if (error) throw error;

  // Count reviews per submission
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.submission_id] = (counts[row.submission_id] || 0) + 1;
  }

  return counts;
}

export type SubmissionReviewStats = {
  numReviews: number;
  overallScore: number | null;
};

/**
 * Get review statistics (count and average score) for multiple submissions.
 * Returns a map of submission_id -> { numReviews, overallScore }.
 */
export async function getReviewStatsForSubmissions(submissionIds: string[]): Promise<Record<string, SubmissionReviewStats>> {
  if (submissionIds.length === 0) return {};

  const { data, error } = await supabase
    .from("reviews")
    .select("submission_id, overall_rating")
    .eq("status", "submitted")
    .in("submission_id", submissionIds);

  if (error) throw error;

  // Calculate count and average score per submission
  const stats: Record<string, SubmissionReviewStats> = {};
  
  for (const row of data ?? []) {
    if (!stats[row.submission_id]) {
      stats[row.submission_id] = {
        numReviews: 0,
        overallScore: null,
      };
    }
    
    stats[row.submission_id].numReviews += 1;
    
    // Calculate running average for overall score
    const currentAvg = stats[row.submission_id].overallScore ?? 0;
    const count = stats[row.submission_id].numReviews;
    const rating = row.overall_rating ?? 0;
    
    stats[row.submission_id].overallScore = 
      (currentAvg * (count - 1) + rating) / count;
  }

  return stats;
}
