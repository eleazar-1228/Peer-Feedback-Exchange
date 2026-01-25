import { useState } from 'react';
import { ArrowLeft, Upload, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface SubmissionFlowProps {
  onBack: () => void;
}

export function SubmissionFlow({ onBack }: SubmissionFlowProps) {
  const [step, setStep] = useState(1);
  const [submissionType, setSubmissionType] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Submit Work for Review</h2>
        <p className="text-gray-600">Follow the steps to submit your work</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Type' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Upload' },
            { num: 4, label: 'Review' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.num}
                </div>
                <span className="mt-2 text-sm text-gray-600">{s.label}</span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Submission Type</h3>
            <p className="text-gray-600 mb-6">What type of work are you submitting?</p>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { type: 'academic', label: 'Academic Paper', icon: FileText, desc: 'Research papers, essays, reports' },
                { type: 'code', label: 'Code Project', icon: Upload, desc: 'Software projects, code repositories' },
                { type: 'design', label: 'Design Work', icon: LinkIcon, desc: 'UI/UX designs, mockups, prototypes' },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSubmissionType(option.type)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    submissionType === option.type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <option.icon className={`w-6 h-6 ${submissionType === option.type ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!submissionType}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Submission Details</h3>
            <p className="text-gray-600 mb-6">Provide information about your submission</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter submission title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a brief description of your work"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment / Course
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select assignment...</option>
                  <option>CS 101 - Final Project</option>
                  <option>ENGL 202 - Research Paper</option>
                  <option>DES 301 - Portfolio Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Reviews Requested
                </label>
                <input
                  type="number"
                  defaultValue={3}
                  min={1}
                  max={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h3>
            <p className="text-gray-600 mb-6">Upload your work for peer review</p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</h4>
              <p className="text-sm text-gray-600 mb-4">Supported formats: PDF, DOCX, ZIP, PNG, JPG</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Select Files
              </button>
            </div>

            {/* Uploaded Files List */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">research-paper.pdf</p>
                    <p className="text-sm text-gray-600">2.4 MB</p>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
              </div>
            </div>

            {/* Alternative: Link Input */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or provide a link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Add Link
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h3>
            <p className="text-gray-600 mb-6">Review your submission before finalizing</p>

            {/* Summary */}
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Submission Type</h4>
                <p className="text-gray-900">Academic Paper</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Title</h4>
                <p className="text-gray-900">Research Paper: AI Ethics in Modern Society</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-900">
                  This paper explores the ethical implications of artificial intelligence in various sectors...
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Files</h4>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-900">research-paper.pdf (2.4 MB)</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Reviews Requested</h4>
                <p className="text-gray-900">3 peer reviews</p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Important</h4>
                <p className="text-sm text-blue-800">
                  Once submitted, your work will be anonymously assigned to peers for review. 
                  You will receive feedback within the specified deadline.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit for Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
