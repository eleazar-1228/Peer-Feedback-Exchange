import { X, Star, ExternalLink } from 'lucide-react';
import { Label } from './ui/label';

interface FeedbackReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    projectTitle: string;
    course: string;
    week: string;
    projectTeam: string;
    submittedWorkUrl: string;
    submittedDate: string;
    feedback: {
      reviewerName: string;
      reviewedDate: string;
      rating: number;
      strengths: string;
      improvements: string;
      oneChange: string;
      otherObservations: string;
      clarity: number;
      organization: number;
      technicalSoundness: number;
      usability: number;
    };
  };
}

export function FeedbackReceivedModal({ isOpen, onClose, submission }: FeedbackReceivedModalProps) {
  if (!isOpen) return null;

  const LikertDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((score) => (
          <div
            key={score}
            className={`flex-1 py-1.5 px-1 text-xs rounded border-2 transition-all ${
              value === score
                ? 'border-green-600 bg-green-50 text-green-900 font-medium'
                : 'border-gray-200 bg-gray-100 text-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Feedback Details</h2>
            <p className="text-sm text-gray-600 mt-1">You are the Author</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Submission Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project title</p>
                  <p className="font-medium text-gray-900">{submission.projectTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Course/semester</p>
                  <p className="font-medium text-gray-900">{submission.course}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Week/module</p>
                  <p className="font-medium text-gray-900">{submission.week}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted by (project team)</p>
                  <p className="font-medium text-gray-900">{submission.projectTeam}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Submitted work</p>
                <a
                  href={submission.submittedWorkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">Open Submitted Work</span>
                </a>
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Received</h3>

            {(submission.feedback.reviewerName || submission.feedback.reviewedDate) && (
              <div className="mb-4 pb-4 border-b border-gray-200 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                {submission.feedback.reviewerName && (
                  <span className="font-medium text-gray-900">From: {submission.feedback.reviewerName}</span>
                )}
                {submission.feedback.reviewedDate && (
                  <span>Reviewed on: {submission.feedback.reviewedDate}</span>
                )}
              </div>
            )}

            <div className="space-y-5">
              {/* Overall Rating */}
              <div className="pb-4 border-b border-gray-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Overall rating
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-7 h-7 ${
                        star <= submission.feedback.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Scoring */}
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Scoring</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <LikertDisplay label="Clarity" value={submission.feedback.clarity} />
                  <LikertDisplay label="Organization" value={submission.feedback.organization} />
                  <LikertDisplay label="Technical Soundness" value={submission.feedback.technicalSoundness} />
                  <LikertDisplay label="Usability" value={submission.feedback.usability} />
                </div>
              </div>

              {/* Written Feedback */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Written Feedback</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      What are the strengths of this work?
                    </Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 min-h-[80px]">
                      {submission.feedback.strengths || <span className="text-gray-400">No response provided</span>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      What could be improved?
                    </Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 min-h-[80px]">
                      {submission.feedback.improvements || <span className="text-gray-400">No response provided</span>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      If you could change one thing, what would it be?
                    </Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 min-h-[80px]">
                      {submission.feedback.oneChange || <span className="text-gray-400">No response provided</span>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Other observations
                    </Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 min-h-[80px]">
                      {submission.feedback.otherObservations || <span className="text-gray-400">No response provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
