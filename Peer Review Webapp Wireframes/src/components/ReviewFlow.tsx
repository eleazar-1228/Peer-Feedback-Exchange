import { useState } from 'react';
import { ArrowLeft, FileText, Star, ExternalLink } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ReviewFlowProps {
  onBack: () => void;
  /** When set, shows the review form directly for editing this completed review */
  editReviewTitle?: string;
  /** Type of the review being edited (Academic Paper, Code Project, etc.) */
  editReviewType?: string;
}

export function ReviewFlow({ onBack, editReviewTitle, editReviewType }: ReviewFlowProps) {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [clarity, setClarity] = useState<number | null>(null);
  const [organization, setOrganization] = useState<number | null>(null);
  const [technicalSoundness, setTechnicalSoundness] = useState<number | null>(null);
  const [usability, setUsability] = useState<number | null>(null);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [oneChange, setOneChange] = useState('');
  const [otherObservations, setOtherObservations] = useState('');

  const assignedReviews = [
    { 
      id: 1, 
      title: 'BU Peer Review Platform', 
      type: 'Academic Paper', 
      due: 'Jan 26, 2026',
      submitted: 'Jan 20, 2026',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 3',
      submittedWorkUrl: 'https://drive.google.com/document/d/example123',
      status: 'Pending' 
    },
    { 
      id: 2, 
      title: 'Mobile Banking App', 
      type: 'Code Review', 
      due: 'Jan 25, 2026',
      submitted: 'Jan 18, 2026',
      course: 'MET CS601 – Spring 1, 2026',
      week: 'Week 4',
      submittedWorkUrl: 'https://drive.google.com/document/d/example456',
      status: 'Pending' 
    },
    { 
      id: 3, 
      title: 'E-commerce Dashboard', 
      type: 'Design Work', 
      due: 'Jan 28, 2026',
      submitted: 'Jan 15, 2026',
      course: 'MET CS633 – Spring 1, 2026',
      week: 'Week 2',
      submittedWorkUrl: 'https://drive.google.com/document/d/example789',
      status: 'Completed' 
    },
  ];

  const selectedSubmission = assignedReviews.find(r => r.id === selectedReview);

  // When editing a completed review from My Completed Reviews, show form directly
  const isEditingCompletedReview = Boolean(editReviewTitle);

  const isFormValid = () => {
    // At least one feedback section must be completed
    const hasTextFeedback = strengths.trim() || improvements.trim() || oneChange.trim() || otherObservations.trim();
    const hasRating = rating > 0;
    const hasScoring = clarity !== null || organization !== null || technicalSoundness !== null || usability !== null;
    
    return hasTextFeedback || hasRating || hasScoring;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Handle submission logic
      if (isEditingCompletedReview) {
        onBack();
      } else {
        setSelectedReview(null);
      }
    }
  };

  const LikertScale = ({ 
    label, 
    value, 
    onChange 
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
                ? 'border-purple-600 bg-purple-50 text-purple-900 font-medium'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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

  if (selectedReview === null && !isEditingCompletedReview) {
    // List View
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Review Assignments</h2>
          <p className="text-gray-600">Select a submission to review</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {assignedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{review.type}</span>
                    </div>
                    <span>Due: {review.due}</span>
                    <span className={review.status === 'Pending' ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                      {review.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReview(review.id)}
                  className={`px-6 py-2 rounded-lg ${
                    review.status === 'Pending'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {review.status === 'Pending' ? 'Start Review' : 'View Review'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For editing completed review, use the passed title/type; otherwise use selected submission
  const displayTitle = isEditingCompletedReview ? editReviewTitle : selectedSubmission?.title;
  const displayType = isEditingCompletedReview ? editReviewType : selectedSubmission?.type;
  const displayCourse = isEditingCompletedReview ? 'MET CS633 – Spring 1, 2026' : selectedSubmission?.course;
  const displayWeek = isEditingCompletedReview ? 'Week 3' : selectedSubmission?.week;
  const displaySubmitted = isEditingCompletedReview ? 'Jan 20, 2026' : selectedSubmission?.submitted;
  const displayDue = isEditingCompletedReview ? 'Jan 26, 2026' : selectedSubmission?.due;
  const displayWorkUrl = isEditingCompletedReview ? 'https://drive.google.com/document/d/example' : selectedSubmission?.submittedWorkUrl;

  // Review Detail View with Submission Details
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => isEditingCompletedReview ? onBack() : setSelectedReview(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {isEditingCompletedReview ? 'Back to Dashboard' : 'Back to Review Assignments'}
        </button>
      </div>

      {/* Submission Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Project title</p>
              <p className="font-medium text-gray-900">{displayTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Course/semester</p>
              <p className="font-medium text-gray-900">{displayCourse}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Week/module</p>
              <p className="font-medium text-gray-900">{displayWeek}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Submitted date</p>
              <p className="font-medium text-gray-900">{displaySubmitted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Due date</p>
              <p className="font-medium text-gray-900">{displayDue}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Submitted work</p>
            <a
              href={displayWorkUrl}
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

      {/* Review Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Your Review</h3>
          <p className="text-sm text-gray-600">Provide constructive feedback for your peer's submission.</p>
        </div>

        <div className="space-y-5">
          {/* SECTION 1: Overall Rating */}
          <div className="pb-4 border-b border-gray-200">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Overall rating
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-colors"
                  type="button"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Scoring (Likert Scales) - 2 Column Grid */}
          <div className="pb-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Scoring</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <LikertScale
                label="Clarity"
                value={clarity}
                onChange={setClarity}
              />
              <LikertScale
                label="Organization"
                value={organization}
                onChange={setOrganization}
              />
              <LikertScale
                label="Technical Soundness"
                value={technicalSoundness}
                onChange={setTechnicalSoundness}
              />
              <LikertScale
                label="Usability"
                value={usability}
                onChange={setUsability}
              />
            </div>
          </div>

          {/* SECTION 3: Written Feedback Questions - 2 Column Grid */}
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
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
            <p className="text-xs text-gray-500 text-center">
              Provide at least one form of feedback to submit.
            </p>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
