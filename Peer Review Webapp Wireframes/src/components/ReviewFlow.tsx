import { useState } from 'react';
import { ArrowLeft, FileText, Star, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

/**
 * Props for the ReviewFlow component
 */
interface ReviewFlowProps {
  /** Callback to navigate back to dashboard */
  onBack: () => void;
  /** When set, shows the review form directly for editing this completed review */
  editReviewTitle?: string;
  /** Type of the review being edited (Academic Paper, Code Project, etc.) */
  editReviewType?: string;
}

/**
 * ReviewFlow Component
 * 
 * Handles the peer review process:
 * - Lists assigned reviews with status (Pending/Completed)
 * - Allows selection of a review to provide feedback
 * - Review form with rating, strengths, improvements, and detailed comments
 * - Form validation and submission handling
 * 
 * Reviews are anonymous - reviewer identity is not shown to submitter
 */
export function ReviewFlow({ onBack, editReviewTitle, editReviewType }: ReviewFlowProps) {
  // Currently selected review ID (null if viewing list)
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  
  // Overall rating for the review (1-5 stars)
  const [rating, setRating] = useState(0);
  
  // Selected strengths checkboxes
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  
  // Detailed feedback text
  const [detailedFeedback, setDetailedFeedback] = useState('');
  
  // Suggestions for improvement text
  const [suggestions, setSuggestions] = useState('');
  
  // Quick feedback selection (strong/needs work)
  const [quickFeedback, setQuickFeedback] = useState<'strong' | 'needs-work' | null>(null);

  // Mock data for assigned reviews - in production, would come from API
  const assignedReviews = [
    { id: 1, title: 'Peer Submission #A547', type: 'Academic Paper', due: 'Jan 26, 2026', status: 'Pending' },
    { id: 2, title: 'Peer Submission #B892', type: 'Code Review', due: 'Jan 25, 2026', status: 'Pending' },
    { id: 3, title: 'Peer Submission #C123', type: 'Design Work', due: 'Jan 28, 2026', status: 'Completed' },
  ];

  /**
   * Handles strength checkbox toggle
   * @param strength - The strength option being toggled
   */
  const handleStrengthToggle = (strength: string) => {
    setSelectedStrengths(prev => 
      prev.includes(strength) 
        ? prev.filter(s => s !== strength)
        : [...prev, strength]
    );
  };

  /**
   * Handles review form submission
   * @param e - Form submit event
   */
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (rating === 0) {
      alert('Please provide an overall rating');
      return;
    }
    
    if (!detailedFeedback.trim()) {
      alert('Please provide detailed feedback');
      return;
    }
    
    // In production, would submit to backend API
    console.log('Review submitted:', {
      reviewId: selectedReview,
      rating,
      strengths: selectedStrengths,
      detailedFeedback,
      suggestions,
      quickFeedback
    });
    
    // Show success message and reset form
    alert('Review submitted successfully!');
    setSelectedReview(null);
    setRating(0);
    setSelectedStrengths([]);
    setDetailedFeedback('');
    setSuggestions('');
    setQuickFeedback(null);
  };

  /**
   * Handles saving review as draft
   */
  const handleSaveDraft = () => {
    // In production, would save to backend/localStorage
    console.log('Draft saved:', {
      reviewId: selectedReview,
      rating,
      strengths: selectedStrengths,
      detailedFeedback,
      suggestions,
      quickFeedback
    });
    alert('Draft saved successfully!');
  };

  // When editing a completed review from My Completed Reviews, show form directly
  const isEditingCompletedReview = Boolean(editReviewTitle);

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

  // Review Detail View - either from list selection or editing completed review
  const displayTitle = isEditingCompletedReview ? editReviewTitle : assignedReviews.find(r => r.id === selectedReview)?.title ?? 'Review';
  const displayType = isEditingCompletedReview ? (editReviewType ?? 'Submission') : assignedReviews.find(r => r.id === selectedReview)?.type ?? '';

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <button
          onClick={() => isEditingCompletedReview ? onBack() : setSelectedReview(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {isEditingCompletedReview ? 'Back to Dashboard' : 'Back to Reviews'}
        </button>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Review Submission</h2>
        <p className="text-gray-600">{displayTitle}{displayType ? ` - ${displayType}` : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-900">{displayType || 'Academic Paper'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Submitted:</span>
                <span className="ml-2 text-gray-900">Jan 20, 2026</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Due Date:</span>
                <span className="ml-2 text-gray-900">Jan 26, 2026</span>
              </div>
            </div>
          </div>

          {/* File Viewer Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Work</h3>
            <div className="border-2 border-gray-200 rounded-lg p-12 bg-gray-50 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Document Viewer</p>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Document
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Anonymous Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Anonymous Review</h4>
              <p className="text-sm text-yellow-800">
                All reviews are anonymous. Do not include identifying information in your feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Review</h3>

            {/* Overall Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Strengths Selection - Checkboxes for common strengths */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Strengths (select all that apply)
              </label>
              <div className="space-y-2">
                {['Clear structure', 'Well-researched', 'Strong arguments', 'Good writing quality'].map((strength) => (
                  <label key={strength} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedStrengths.includes(strength)}
                      onChange={() => handleStrengthToggle(strength)}
                    />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Feedback Textarea - Required field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Feedback *
              </label>
              <textarea
                rows={6}
                placeholder="Provide constructive feedback..."
                value={detailedFeedback}
                onChange={(e) => setDetailedFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Suggestions for Improvement Textarea - Optional field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement
              </label>
              <textarea
                rows={4}
                placeholder="What could be improved..."
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Quick Feedback Buttons - Optional quick assessment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Feedback
              </label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setQuickFeedback(quickFeedback === 'strong' ? null : 'strong')}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1 ${
                    quickFeedback === 'strong' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Strong
                </button>
                <button 
                  type="button"
                  onClick={() => setQuickFeedback(quickFeedback === 'needs-work' ? null : 'needs-work')}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1 ${
                    quickFeedback === 'needs-work' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Needs Work
                </button>
              </div>
            </div>

            {/* Action Buttons - Submit or Save Draft */}
            <div className="space-y-2">
              <button 
                onClick={handleSubmitReview}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Submit Review
              </button>
              <button 
                type="button"
                onClick={handleSaveDraft}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
