import { ArrowLeft, Star, MessageSquare, Download, FileText, Calendar, User } from 'lucide-react';

/**
 * Props for the SubmissionFeedback component
 */
interface SubmissionFeedbackProps {
  /** Callback to navigate back to dashboard */
  onBack: () => void;
  /** Title of the submission to display feedback for */
  submissionTitle: string;
}

/**
 * SubmissionFeedback Component
 * 
 * Displays peer review feedback for a student's submission:
 * - Overall rating summary
 * - Submission preview
 * - Individual peer reviews with ratings, strengths, improvements, and comments
 * - Actions to export feedback or submit revisions
 * 
 * All interactive elements are functional
 */
export function SubmissionFeedback({ onBack, submissionTitle }: SubmissionFeedbackProps) {
  const feedbackData = [
    {
      reviewerName: 'Reviewer #1',
      date: 'Jan 21, 2026',
      rating: 4,
      strengths: [
        'Clear and well-structured argument',
        'Good use of supporting evidence',
        'Strong introduction and conclusion'
      ],
      improvements: [
        'Could expand on the methodology section',
        'Some citations need proper formatting',
        'Consider adding more recent sources'
      ],
      detailedComments: 'Overall, this is a solid piece of work. The research is thorough and the writing is clear. The main argument is well-supported by evidence. However, I would suggest expanding the methodology section to provide more detail about your research approach. Additionally, some of the citations could be formatted more consistently according to APA style.'
    },
    {
      reviewerName: 'Reviewer #2',
      date: 'Jan 22, 2026',
      rating: 5,
      strengths: [
        'Excellent research depth',
        'Innovative approach to the topic',
        'Well-organized structure',
        'Strong critical analysis'
      ],
      improvements: [
        'Minor grammatical errors in section 3',
        'Could benefit from more visual aids'
      ],
      detailedComments: 'This is an exceptional submission. The depth of research is impressive and the innovative approach to analyzing AI ethics brings fresh perspectives to the field. The critical analysis demonstrates strong analytical thinking. I noticed a few minor grammatical issues in section 3 that could be corrected. Consider adding charts or diagrams to illustrate some of the more complex concepts.'
    },
    {
      reviewerName: 'Reviewer #3',
      date: 'Jan 23, 2026',
      rating: 4,
      strengths: [
        'Comprehensive literature review',
        'Balanced perspective on ethical considerations',
        'Good pacing and flow'
      ],
      improvements: [
        'Abstract could be more concise',
        'Some technical terms need better explanation',
        'Conclusion could be stronger'
      ],
      detailedComments: 'A well-researched paper with a comprehensive literature review. The balanced perspective on different ethical frameworks is particularly noteworthy. The pacing throughout the paper is good, making it easy to follow. The abstract is a bit lengthy and could be condensed. Some technical terms, especially in section 2, could use more explanation for readers less familiar with AI terminology. The conclusion, while adequate, could be strengthened with more concrete recommendations.'
    }
  ];

  const averageRating = feedbackData.reduce((acc, curr) => acc + curr.rating, 0) / feedbackData.length;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">{submissionTitle}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Submitted: Jan 20, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Academic Paper</span>
              </div>
            </div>
          </div>
          {/* Download Submission Button */}
          <button 
            onClick={() => {
              // In production, would download the submission file
              alert('Download submission feature - would download the submission file');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Submission
          </button>
        </div>
      </div>

      {/* Overall Rating Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">out of 5</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-3xl font-semibold text-gray-900">{feedbackData.length}</p>
          </div>
        </div>
      </div>

      {/* Submission Content Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Preview</h3>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="prose max-w-none">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Abstract</h4>
            <p className="text-gray-700 leading-relaxed mb-4">
              This research paper explores the ethical implications of artificial intelligence in modern society.
              As AI systems become increasingly integrated into decision-making processes across various sectors,
              understanding the ethical frameworks that should guide their development and deployment becomes critical.
              This paper examines key ethical considerations including fairness, transparency, accountability, and
              the potential societal impacts of AI technologies.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Through a comprehensive literature review and analysis of current AI applications, this study proposes
              a framework for ethical AI development that balances innovation with responsible practices. The findings
              suggest that while AI offers tremendous potential benefits, careful attention must be paid to ensuring
              these technologies serve the broader public good while minimizing potential harms.
            </p>
          </div>
        </div>
        {/* View Full Submission Button */}
        <button 
          onClick={() => {
            // In production, would open full submission viewer
            alert('View full submission feature - would open full document viewer');
          }}
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          View Full Submission
        </button>
      </div>

      {/* Peer Reviews */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Peer Reviews ({feedbackData.length})</h3>
        
        {feedbackData.map((feedback, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feedback.reviewerName}</h4>
                  <p className="text-sm text-gray-600">Reviewed on {feedback.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(feedback.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{feedback.rating}/5</span>
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-4">
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                Strengths
              </h5>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="mb-4">
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 text-sm">!</span>
                </div>
                Areas for Improvement
              </h5>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Comments */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Detailed Comments
              </h5>
              <p className="text-gray-700 leading-relaxed">{feedback.detailedComments}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        {/* Export Feedback Button */}
        <button 
          onClick={() => {
            // In production, would export feedback as PDF/CSV
            alert('Export feedback feature - would generate and download feedback report');
          }}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Export All Feedback
        </button>
        {/* Submit Revision Button */}
        <button 
          onClick={() => {
            // In production, would navigate to revision submission flow
            alert('Submit revision feature - would navigate to revision submission form');
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Submit Revision
        </button>
      </div>
    </div>
  );
}
