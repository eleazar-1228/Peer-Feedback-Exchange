import { useState } from 'react';
import { ArrowLeft, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { format } from 'date-fns';

interface SubmissionFlowProps {
  onBack: () => void;
}

export function SubmissionFlow({ onBack }: SubmissionFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [course, setCourse] = useState('');
  const [week, setWeek] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectDocument, setProjectDocument] = useState('');
  const [projectTeam, setProjectTeam] = useState('');
  const [feedbackCategories, setFeedbackCategories] = useState({
    general: false,
    technical: false,
    presentation: false,
    contentStructure: false,
  });
  const [dueDate, setDueDate] = useState<Date>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [touched, setTouched] = useState({
    course: false,
    week: false,
    projectTitle: false,
    projectDocument: false,
    projectTeam: false,
    feedbackCategories: false,
    dueDate: false,
  });

  const handleCategoryChange = (category: keyof typeof feedbackCategories) => {
    setFeedbackCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
    setTouched(prev => ({ ...prev, feedbackCategories: true }));
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const atLeastOneCategorySelected = Object.values(feedbackCategories).some(v => v);

  const isStep1Valid = () => {
    return course && week && projectTitle && projectTeam;
  };

  const isStep2Valid = () => {
    return isValidUrl(projectDocument) && atLeastOneCategorySelected && dueDate;
  };

  const isFormValid = () => {
    return isStep1Valid() && isStep2Valid();
  };

  const handleNext = () => {
    // Mark all step 1 fields as touched
    setTouched(prev => ({
      ...prev,
      course: true,
      week: true,
      projectTitle: true,
      projectTeam: true,
    }));

    if (isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    // Mark all step 2 fields as touched
    setTouched(prev => ({
      ...prev,
      projectDocument: true,
      feedbackCategories: true,
      dueDate: true,
    }));

    if (isFormValid()) {
      // Handle submission logic
      onBack();
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldValidationClass = (isValid: boolean, isTouched: boolean) => {
    if (!isTouched) return '';
    return isValid ? 'border-green-500 focus-visible:ring-green-500' : 'border-red-500 focus-visible:ring-red-500';
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Submit Work for Review</h2>
        <p className="text-gray-600">Complete the following steps to submit your work for peer review</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 1 ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 1 ? '1' : '✓'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Course & Project Info</div>
            </div>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${currentStep === 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          <div className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${currentStep === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Submission Details
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-visible">
        {currentStep === 1 && (
          <div className="space-y-5">
            {/* Step 1: Course & Project Info */}
            <div>
              <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                Course/class/semester <span className="text-red-500">*</span>
              </Label>
              <Input
                id="course"
                type="text"
                placeholder="MET CS633 – Spring 1, 2026"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                onBlur={() => handleBlur('course')}
                className={`mt-1.5 ${getFieldValidationClass(!!course, touched.course)}`}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Enter course code, name, and semester.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week" className="text-sm font-medium text-gray-700">
                  Week/module <span className="text-red-500">*</span>
                </Label>
                <Select value={week} onValueChange={(value) => { setWeek(value); handleBlur('week'); }}>
                  <SelectTrigger className={`mt-1.5 ${getFieldValidationClass(!!week, touched.week)}`}>
                    <SelectValue placeholder="Select week..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week1">Week 1</SelectItem>
                    <SelectItem value="week2">Week 2</SelectItem>
                    <SelectItem value="week3">Week 3</SelectItem>
                    <SelectItem value="week4">Week 4</SelectItem>
                    <SelectItem value="week5">Week 5</SelectItem>
                    <SelectItem value="week6">Week 6</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">Select the applicable week.</p>
              </div>

              <div>
                <Label htmlFor="projectTeam" className="text-sm font-medium text-gray-700">
                  Project team <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectTeam"
                  type="text"
                  placeholder="Team Four"
                  value={projectTeam}
                  onChange={(e) => setProjectTeam(e.target.value)}
                  onBlur={() => handleBlur('projectTeam')}
                  className={`mt-1.5 ${getFieldValidationClass(!!projectTeam, touched.projectTeam)}`}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter team name or number.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="projectTitle" className="text-sm font-medium text-gray-700">
                Project title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectTitle"
                type="text"
                placeholder="BU Peer Review Platform"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => handleBlur('projectTitle')}
                className={`mt-1.5 ${getFieldValidationClass(!!projectTitle, touched.projectTitle)}`}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Enter a clear, descriptive title for your project.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            {/* Step 2: Submission Details */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (feedback request context)
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
                placeholder="Describe the type of feedback you are seeking."
              />
              <p className="mt-1 text-xs text-gray-500">Briefly describe what kind of feedback you are seeking.</p>
            </div>

            <div>
              <Label htmlFor="projectDocument" className="text-sm font-medium text-gray-700">
                Project document <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  id="projectDocument"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={projectDocument}
                  onChange={(e) => setProjectDocument(e.target.value)}
                  onBlur={() => handleBlur('projectDocument')}
                  className={`pl-10 ${getFieldValidationClass(isValidUrl(projectDocument), touched.projectDocument)}`}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Provide a read-only Google Drive or hosted document link.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Feedback category <span className="text-red-500">*</span>
                </Label>
                <div className={`space-y-2.5 p-3 rounded-lg border-2 ${
                  touched.feedbackCategories && !atLeastOneCategorySelected 
                    ? 'border-red-500 bg-red-50' 
                    : touched.feedbackCategories && atLeastOneCategorySelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="general"
                      checked={feedbackCategories.general}
                      onCheckedChange={() => handleCategoryChange('general')}
                    />
                    <label htmlFor="general" className="text-sm text-gray-700 cursor-pointer">
                      General Feedback
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="technical"
                      checked={feedbackCategories.technical}
                      onCheckedChange={() => handleCategoryChange('technical')}
                    />
                    <label htmlFor="technical" className="text-sm text-gray-700 cursor-pointer">
                      Technical Feedback
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="presentation"
                      checked={feedbackCategories.presentation}
                      onCheckedChange={() => handleCategoryChange('presentation')}
                    />
                    <label htmlFor="presentation" className="text-sm text-gray-700 cursor-pointer">
                      Presentation Feedback
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contentStructure"
                      checked={feedbackCategories.contentStructure}
                      onCheckedChange={() => handleCategoryChange('contentStructure')}
                    />
                    <label htmlFor="contentStructure" className="text-sm text-gray-700 cursor-pointer">
                      Content Structure Feedback
                    </label>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Select at least one category.</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Due date <span className="text-red-500">*</span>
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full justify-start text-left font-normal px-4 py-2 border rounded-md ${
                        touched.dueDate && !dueDate
                          ? "border-red-500"
                          : touched.dueDate && dueDate
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => {
                        handleBlur("dueDate");
                        setDatePickerOpen(true);
                      }}
                    >
                      {dueDate ? format(dueDate, "dd/MM/yyyy") : "Select date..."}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto p-3 bg-white border border-gray-200 shadow-lg rounded-md z-50"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date);
                        handleBlur("dueDate");
                        setDatePickerOpen(false);
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <p className="mt-1 text-xs text-gray-500">Select a future date for deadline.</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2.5">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-0.5 text-sm">Important</h4>
                <p className="text-xs text-blue-800">
                  Once submitted, your work will be anonymously assigned to peers for review. 
                  You will receive feedback within the specified deadline.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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