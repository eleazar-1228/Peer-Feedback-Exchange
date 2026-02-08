import { Star } from 'lucide-react';

interface Review {
  reviewerName: string;
  overallRating: number;
  clarity: number | null;
  organization: number | null;
  technicalSoundness: number | null;
  usability: number | null;
  strengths: string;
  improvements: string;
  oneChange: string;
  otherObservations: string;
}

interface FeedbackDisplayProps {
  review: Review;
}

export function FeedbackDisplay({ review }: FeedbackDisplayProps) {
  const LikertDisplay = ({ label, value }: { label: string; value: number }) => (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <div
            key={score}
            className={`flex-1 py-1.5 px-1 text-xs rounded border-2 text-center ${
              value === score
                ? 'border-green-600 bg-green-50 text-green-900 font-medium'
                : 'border-gray-200 bg-gray-100 text-gray-500'
            }`}
          >
            <div className="font-semibold">{score}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium text-gray-900">{review.reviewerName}</h5>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Overall rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.overallRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scoring */}
      {(review.clarity !== null ||
        review.organization !== null ||
        review.technicalSoundness !== null ||
        review.usability !== null) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h6 className="font-semibold text-gray-900 mb-3">Scoring</h6>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {review.clarity !== null && (
              <LikertDisplay label="Clarity" value={review.clarity} />
            )}
            {review.organization !== null && (
              <LikertDisplay label="Organization" value={review.organization} />
            )}
            {review.technicalSoundness !== null && (
              <LikertDisplay label="Technical Soundness" value={review.technicalSoundness} />
            )}
            {review.usability !== null && (
              <LikertDisplay label="Usability" value={review.usability} />
            )}
          </div>
        </div>
      )}

      {/* Written Feedback */}
      <div>
        <h6 className="font-semibold text-gray-900 mb-3">Written Feedback</h6>
        <div className="space-y-4">
          {review.strengths && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                What are the strengths of this work?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                {review.strengths}
              </div>
            </div>
          )}
          {review.improvements && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                What could be improved?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                {review.improvements}
              </div>
            </div>
          )}
          {review.oneChange && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                If you could change one thing, what would it be?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                {review.oneChange}
              </div>
            </div>
          )}
          {review.otherObservations && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Other observations
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                {review.otherObservations}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
