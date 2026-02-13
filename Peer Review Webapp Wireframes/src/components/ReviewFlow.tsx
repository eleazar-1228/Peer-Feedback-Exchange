import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Star, ExternalLink } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

import {
  getReviewableSubmissions,
  getMyReviewForSubmission,
  saveDraftReview,
  submitReview,
  type ReviewableSubmission,
} from "../lib/reviewService";

interface ReviewFlowProps {
  onBack: () => void;
}

export function ReviewFlow({ onBack }: ReviewFlowProps) {
  // List + selection
  const [assignedReviews, setAssignedReviews] = useState<ReviewableSubmission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Loading / status
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");

  // Review form state
  const [rating, setRating] = useState(0);
  const [clarity, setClarity] = useState<number | null>(null);
  const [organization, setOrganization] = useState<number | null>(null);
  const [technicalSoundness, setTechnicalSoundness] = useState<number | null>(null);
  const [usability, setUsability] = useState<number | null>(null);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [oneChange, setOneChange] = useState("");
  const [otherObservations, setOtherObservations] = useState("");

  // Load list of reviewable submissions
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const subs = await getReviewableSubmissions();
        setAssignedReviews(subs);
      } catch (e: any) {
        console.error(e);
        setMessage(e?.message ?? "Failed to load review assignments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedSubmission = useMemo(
    () => assignedReviews.find(s => s.id === selectedSubmissionId) ?? null,
    [assignedReviews, selectedSubmissionId]
  );

  // When opening a submission, auto-load any existing draft/submitted review
  useEffect(() => {
    async function loadDraft() {
      if (!selectedSubmissionId) return;

      setDetailLoading(true);
      setMessage("");

      // Clear form first (so you don't see previous submission's values)
      setRating(0);
      setClarity(null);
      setOrganization(null);
      setTechnicalSoundness(null);
      setUsability(null);
      setStrengths("");
      setImprovements("");
      setOneChange("");
      setOtherObservations("");

      try {
        const existing = await getMyReviewForSubmission(selectedSubmissionId);
        if (existing) {
          setRating(existing.overall_rating ?? 0);
          setClarity(existing.clarity);
          setOrganization(existing.organization);
          setTechnicalSoundness(existing.technical_soundness);
          setUsability(existing.usability);

          setStrengths(existing.strengths ?? "");
          setImprovements(existing.improvements ?? "");
          setOneChange(existing.one_change ?? "");
          setOtherObservations(existing.other_observations ?? "");
        }
      } catch (e: any) {
        console.error(e);
        setMessage(e?.message ?? "Failed to load your draft review");
      } finally {
        setDetailLoading(false);
      }
    }

    loadDraft();
  }, [selectedSubmissionId]);

  const isFormValid = () => {
    const hasTextFeedback =
      strengths.trim() || improvements.trim() || oneChange.trim() || otherObservations.trim();
    const hasRating = rating > 0;
    const hasScoring = clarity !== null || organization !== null || technicalSoundness !== null || usability !== null;
    return Boolean(hasTextFeedback || hasRating || hasScoring);
  };

  const reviewPayload = () => ({
    overallRating: rating > 0 ? rating : null,
    clarity,
    organization,
    technicalSoundness,
    usability,
    strengths,
    improvements,
    oneChange,
    otherObservations,
  });

  const handleSaveDraft = async () => {
    if (!selectedSubmissionId) return;
    if (!isFormValid()) {
      setMessage("Add at least one piece of feedback (stars, scores, or text) before saving.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await saveDraftReview(selectedSubmissionId, reviewPayload());
      setMessage("Draft saved ✅");
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message ?? "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmissionId) return;
    if (!isFormValid()) return;

    setSubmitting(true);
    setMessage("");
    try {
      await submitReview(selectedSubmissionId, reviewPayload());
      setMessage("Review submitted ✅");

      // Remove from list (since getReviewableSubmissions filters out submitted-by-me)
      setAssignedReviews(prev => prev.filter(s => s.id !== selectedSubmissionId));
      setSelectedSubmissionId(null);
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const LikertScale = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number | null;
    onChange: (val: number) => void;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 py-1.5 px-1 text-xs rounded border-2 transition-all ${
              value === score
                ? "border-purple-600 bg-purple-50 text-purple-900 font-medium"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{score}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // --- List View ---
  if (selectedSubmissionId === null) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Review Assignments</h2>
          <p className="text-gray-600">Select a submission to review</p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded border border-gray-200 bg-white text-sm text-gray-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">Loading assignments…</div>
        ) : assignedReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            No submissions available for you to review right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignedReviews.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{sub.project_title}</h3>
                    <div className="flex gap-6 text-sm text-gray-600 flex-wrap">
                      <span className="font-medium text-gray-900">Submitted by: {sub.project_team}</span>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>Submission</span>
                      </div>
                      <span>Due: {new Date(sub.due_date).toLocaleDateString()}</span>
                      <span className="text-orange-600 font-medium">
                        {sub.status === "pending" ? "Pending" : sub.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Start Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Detail View ---
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedSubmissionId(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Review Assignments
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded border border-gray-200 bg-white text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* Submission Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>

        {detailLoading || !selectedSubmission ? (
          <div className="text-sm text-gray-600">Loading submission…</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Project title</p>
                <p className="font-medium text-gray-900">{selectedSubmission.project_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted by</p>
                <p className="font-medium text-gray-900">{selectedSubmission.project_team}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course/semester</p>
                <p className="font-medium text-gray-900">{selectedSubmission.course}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Week/module</p>
                <p className="font-medium text-gray-900">{selectedSubmission.week}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedSubmission.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due date</p>
                <p className="font-medium text-gray-900">{selectedSubmission.due_date}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Submitted work</p>
              <a
                href={selectedSubmission.project_document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Open Submitted Work</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Review Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Your Review</h3>
          <p className="text-sm text-gray-600">Provide constructive feedback for your peer&apos;s submission.</p>
        </div>

        <div className="space-y-5">
          {/* Overall Rating */}
          <div className="pb-4 border-b border-gray-200">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Overall rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-colors" type="button">
                  <Star className={`w-7 h-7 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Scoring */}
          <div className="pb-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Scoring</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <LikertScale label="Clarity" value={clarity} onChange={setClarity} />
              <LikertScale label="Organization" value={organization} onChange={setOrganization} />
              <LikertScale label="Technical Soundness" value={technicalSoundness} onChange={setTechnicalSoundness} />
              <LikertScale label="Usability" value={usability} onChange={setUsability} />
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Written Feedback</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strengths" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  What are the strengths of this work?
                </Label>
                <Textarea
                  id="strengths"
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Describe what was done well..."
                  className="w-full text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{strengths.length}/500</p>
              </div>

              <div>
                <Label htmlFor="improvements" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  What could be improved?
                </Label>
                <Textarea
                  id="improvements"
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Provide constructive suggestions..."
                  className="w-full text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{improvements.length}/500</p>
              </div>

              <div>
                <Label htmlFor="oneChange" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  If you could change one thing, what would it be?
                </Label>
                <Textarea
                  id="oneChange"
                  rows={3}
                  value={oneChange}
                  onChange={(e) => setOneChange(e.target.value)}
                  placeholder="Identify the most impactful change..."
                  className="w-full text-sm"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{oneChange.length}/300</p>
              </div>

              <div>
                <Label htmlFor="otherObservations" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Other observations
                </Label>
                <Textarea
                  id="otherObservations"
                  rows={3}
                  value={otherObservations}
                  onChange={(e) => setOtherObservations(e.target.value)}
                  placeholder="Additional comments or notes..."
                  className="w-full text-sm"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{otherObservations.length}/300</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmitReview}
              disabled={!isFormValid() || submitting}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={!isFormValid() || saving}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <p className="text-xs text-gray-500 text-center">Provide at least one form of feedback to save/submit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
