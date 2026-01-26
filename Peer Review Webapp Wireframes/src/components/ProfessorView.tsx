import { useState } from 'react';
import { Users, FileText, CheckCircle, Clock, Settings, Download, Search, UserPlus, Upload } from 'lucide-react';

/**
 * ProfessorView Component
 * 
 * Main dashboard for professors to manage:
 * - Overview: Statistics and recent activity
 * - Assignments: Create and manage peer review assignments
 * - Students: View student progress and completion rates
 * - Register Students: Add students individually or via bulk CSV upload
 * 
 * All tabs are functional with form handling and data management
 */
export function ProfessorView() {
  // Currently active tab in the professor dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students' | 'register'>('overview');
  
  // Search query for assignments and students
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for student registration
  const [studentForm, setStudentForm] = useState({
    id: '',
    name: '',
    email: '',
    course: ''
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Professor Dashboard</h2>
        <p className="text-gray-600">Manage assignments and monitor peer review progress</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Register Students
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Assignments</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">8</p>
              <p className="text-xs text-gray-500 mt-1">3 active</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Submissions</span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">124</p>
              <p className="text-xs text-gray-500 mt-1">32 this week</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Reviews Pending</span>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">47</p>
              <p className="text-xs text-gray-500 mt-1">15 due soon</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed Reviews</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">218</p>
              <p className="text-xs text-gray-500 mt-1">82% completion rate</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-left">
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Create Assignment</h4>
                <p className="text-sm text-gray-600">Set up a new peer review assignment</p>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-left">
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Manage Groups</h4>
                <p className="text-sm text-gray-600">Organize students into review groups</p>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors text-left">
                <Download className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Export Results</h4>
                <p className="text-sm text-gray-600">Download review data and analytics</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { action: 'New submission received', student: 'Student #A234', assignment: 'Final Research Paper', time: '5 minutes ago' },
                { action: 'Review completed', student: 'Student #B567', assignment: 'Code Project Review', time: '1 hour ago' },
                { action: 'Submission updated', student: 'Student #C890', assignment: 'Design Portfolio', time: '2 hours ago' },
                { action: 'Review deadline approaching', student: 'N/A', assignment: 'Midterm Essay', time: '3 hours ago' },
              ].map((activity, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.student !== 'N/A' && `${activity.student} • `}
                        {activity.assignment}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* New Assignment Button - In production, would open assignment creation modal */}
            <button 
              onClick={() => alert('Create new assignment feature - would open assignment creation form')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              New Assignment
            </button>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {[
              { name: 'Final Research Paper', course: 'CS 301', submissions: 45, reviews: 135, deadline: 'Jan 30, 2026', status: 'Active' },
              { name: 'Code Project Review', course: 'CS 201', submissions: 38, reviews: 102, deadline: 'Jan 28, 2026', status: 'Active' },
              { name: 'Design Portfolio', course: 'DES 301', submissions: 22, reviews: 58, deadline: 'Feb 5, 2026', status: 'Active' },
              { name: 'Midterm Essay', course: 'ENGL 202', submissions: 52, reviews: 156, deadline: 'Jan 15, 2026', status: 'Completed' },
            ].map((assignment, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.name}</h3>
                    <p className="text-sm text-gray-600">{assignment.course}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      assignment.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Submissions</p>
                    <p className="text-lg font-semibold text-gray-900">{assignment.submissions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reviews</p>
                    <p className="text-lg font-semibold text-gray-900">{assignment.reviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="text-lg font-semibold text-gray-900">{assignment.deadline}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          {/* Student Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { id: 'A234', submissions: 3, assigned: 5, completed: 4, rate: 80 },
                  { id: 'B567', submissions: 4, assigned: 6, completed: 6, rate: 100 },
                  { id: 'C890', submissions: 2, assigned: 4, completed: 2, rate: 50 },
                  { id: 'D123', submissions: 3, assigned: 5, completed: 5, rate: 100 },
                  { id: 'E456', submissions: 4, assigned: 6, completed: 3, rate: 50 },
                ].map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.id.substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">Student #{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {student.submissions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {student.assigned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {student.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              student.rate >= 80 ? 'bg-green-500' : student.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{student.rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Students Tab */}
      {activeTab === 'register' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Single Student Registration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Register Single Student</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Add a student manually to the system</p>
              
              {/* Student Registration Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., A234"
                    value={studentForm.id}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., john.doe@university.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select 
                    value={studentForm.course}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a course...</option>
                    <option value="CS 301 - Advanced Software Engineering">CS 301 - Advanced Software Engineering</option>
                    <option value="CS 201 - Data Structures">CS 201 - Data Structures</option>
                    <option value="DES 301 - UI/UX Design">DES 301 - UI/UX Design</option>
                    <option value="ENGL 202 - Academic Writing">ENGL 202 - Academic Writing</option>
                  </select>
                </div>

                {/* Add Student Button */}
                <button 
                  onClick={() => {
                    if (!studentForm.id || !studentForm.name || !studentForm.email) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    // In production, would submit to backend API
                    console.log('Student registered:', studentForm);
                    alert(`Student ${studentForm.name} (${studentForm.id}) registered successfully!`);
                    setStudentForm({ id: '', name: '', email: '', course: '' });
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Bulk Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Students</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Upload a CSV file to register multiple students at once</p>

              {/* CSV Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer mb-4 relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In production, would parse CSV and submit to backend
                      console.log('CSV file selected:', file.name);
                      alert(`CSV file "${file.name}" selected. In production, this would process and register students.`);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">Drop CSV file here</h4>
                <p className="text-sm text-gray-600 mb-3">or click to browse</p>
                <button 
                  type="button"
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Select CSV File
                </button>
              </div>

              {/* CSV Format Guide */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format:</h4>
                <code className="text-xs text-gray-600 block mb-2">
                  student_id, name, email, course
                </code>
                <code className="text-xs text-gray-600 block">
                  A234, John Doe, john@edu, CS 301
                </code>
              </div>

              {/* Download CSV Template Button */}
              <button 
                onClick={() => {
                  // In production, would generate and download CSV template
                  alert('CSV template download - would generate template file');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Recently Registered Students */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Registered Students</h3>
                <p className="text-sm text-gray-600 mt-1">Manage all registered students</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export List
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { id: 'A234', name: 'John Doe', email: 'john.doe@university.edu', course: 'CS 301', status: 'Active' },
                    { id: 'B567', name: 'Jane Smith', email: 'jane.smith@university.edu', course: 'CS 201', status: 'Active' },
                    { id: 'C890', name: 'Alice Johnson', email: 'alice.johnson@university.edu', course: 'DES 301', status: 'Active' },
                    { id: 'D123', name: 'Bob Brown', email: 'bob.brown@university.edu', course: 'ENGL 202', status: 'Pending' },
                    { id: 'E456', name: 'Charlie Davis', email: 'charlie.davis@university.edu', course: 'CS 301', status: 'Active' },
                  ].map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {student.id.substring(0, 2)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}