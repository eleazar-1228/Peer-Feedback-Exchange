// src/lib/analyticsService.ts
import { supabase } from "./supabaseClient";

export type TopProjectByReviews = {
  id: string;
  projectTitle: string;
  course: string;
  teamName: string;
  reviewCount: number;
};

export type TopCourseByReviews = {
  course: string;
  reviewCount: number;
};

export type TopReviewer = {
  reviewerId: string;
  reviewerName: string;
  reviewCount: number;
};

/**
 * Fetch top N projects (submissions) by number of submitted reviews.
 * Counts reviews per submission from the reviews table since submissions has no review count.
 */
export async function getTopProjectsByReviews(
  limit = 5
): Promise<TopProjectByReviews[]> {
  const { data: reviews, error: revErr } = await supabase
    .from("reviews")
    .select("submission_id")
    .eq("status", "submitted");

  if (revErr) throw revErr;

  const countBySubmission: Record<string, number> = {};
  for (const r of reviews ?? []) {
    countBySubmission[r.submission_id] = (countBySubmission[r.submission_id] ?? 0) + 1;
  }

  const topSubmissionIds = Object.entries(countBySubmission)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topSubmissionIds.length === 0) return [];

  const { data: subs, error: subsErr } = await supabase
    .from("submissions")
    .select("id, project_title, course, project_team")
    .in("id", topSubmissionIds);

  if (subsErr) throw subsErr;

  const subMap = new Map((subs ?? []).map((s) => [s.id, s]));

  return topSubmissionIds
    .map((id) => {
      const sub = subMap.get(id);
      if (!sub) return null;
      return {
        id,
        projectTitle: sub.project_title ?? "Untitled",
        course: sub.course ?? "",
        teamName: sub.project_team ?? "",
        reviewCount: countBySubmission[id],
      };
    })
    .filter(Boolean) as TopProjectByReviews[];
}

/**
 * Fetch top N courses by total number of submitted reviews.
 */
export async function getTopCoursesByReviews(
  limit = 5
): Promise<TopCourseByReviews[]> {
  const { data: reviews, error: revErr } = await supabase
    .from("reviews")
    .select("submission_id")
    .eq("status", "submitted");

  if (revErr) throw revErr;

  const submissionIds = [...new Set((reviews ?? []).map((r) => r.submission_id))];
  if (submissionIds.length === 0) return [];

  const { data: subs, error: subsErr } = await supabase
    .from("submissions")
    .select("id, course")
    .in("id", submissionIds);

  if (subsErr) throw subsErr;

  const subByCourse: Record<string, string[]> = {};
  for (const s of subs ?? []) {
    const c = s.course ?? "Unknown";
    if (!subByCourse[c]) subByCourse[c] = [];
    subByCourse[c].push(s.id);
  }

  const countBySubmission: Record<string, number> = {};
  for (const r of reviews ?? []) {
    countBySubmission[r.submission_id] = (countBySubmission[r.submission_id] ?? 0) + 1;
  }

  const courseTotals = Object.entries(subByCourse).map(([course, ids]) => ({
    course,
    reviewCount: ids.reduce((sum, id) => sum + (countBySubmission[id] ?? 0), 0),
  }));

  return courseTotals
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

/**
 * Fetch top N reviewers by number of submitted reviews.
 * Uses profiles (first_name, last_name, student_id) for display names.
 */
export async function getTopReviewers(limit = 3): Promise<TopReviewer[]> {
  const { data: reviews, error: revErr } = await supabase
    .from("reviews")
    .select("reviewer_id")
    .eq("status", "submitted");

  if (revErr) throw revErr;

  const countByReviewer: Record<string, number> = {};
  for (const r of reviews ?? []) {
    countByReviewer[r.reviewer_id] = (countByReviewer[r.reviewer_id] ?? 0) + 1;
  }

  const topReviewerIds = Object.entries(countByReviewer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topReviewerIds.length === 0) return [];

  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, student_id")
    .in("id", topReviewerIds);

  if (profErr) throw profErr;

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return topReviewerIds.map((id) => {
    const p = profileMap.get(id);
    const reviewerName =
      p
        ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
          p.student_id ||
          "Anonymous"
        : "Anonymous";
    return {
      reviewerId: id,
      reviewerName,
      reviewCount: countByReviewer[id],
    };
  });
}

export type SubmissionReviewStats = {
  reviewCount: number;
  avgScore: number | null;
};

/**
 * Get review count and average overall_rating per submission.
 * Used to enrich submission lists (numReviews, overallScore) since submissions table has no review stats.
 */
export async function getSubmissionReviewStats(): Promise<
  Map<string, SubmissionReviewStats>
> {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("submission_id, overall_rating")
    .eq("status", "submitted");

  if (error) throw error;

  const bySubmission: Record<
    string,
    { total: number; sum: number; count: number }
  > = {};
  for (const r of reviews ?? []) {
    const sid = r.submission_id;
    if (!bySubmission[sid]) bySubmission[sid] = { total: 0, sum: 0, count: 0 };
    bySubmission[sid].count += 1;
    const rating = r.overall_rating;
    if (typeof rating === "number") bySubmission[sid].sum += rating;
  }

  const map = new Map<string, SubmissionReviewStats>();
  for (const [sid, stats] of Object.entries(bySubmission)) {
    map.set(sid, {
      reviewCount: stats.count,
      avgScore: stats.count > 0 ? stats.sum / stats.count : null,
    });
  }
  return map;
}
