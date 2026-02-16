import { useEffect, useState } from 'react';
import { ArrowLeft, User, Mail, BookOpen, Hash, Save } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getMyProfile, updateMyProfile } from '../lib/profileService';

interface AccountSettingsProps {
  onBack: () => void;
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile();
        if (profile) {
          setFirstName(profile.first_name as string || '');
          setLastName(profile.last_name as string || '');
          setStudentId(profile.student_id as string || '');
          setCourse(profile.course as string || '');
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateMyProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        student_id: studentId.trim() || null,
        course: course.trim() || null,
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      console.error("Failed to update profile:", e);
      alert(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          Loading your profile...
        </div>
      </div>
    );
  }

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
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="studentId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1.5"
                />
              </div>

            </div>
          </div>

          {/* Academic Information Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Academic Information
            </h3>
            <div>
              <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                Course
              </Label>
              <Input
                id="course"
                type="text"
                placeholder="Enter your course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-gray-500">Your primary course or program</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
