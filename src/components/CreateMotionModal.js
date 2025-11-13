import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

function CreateMotionModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    fullText: '',
    meetingId: '',
    proposerId: '',
    seconderId: ''
  });

  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (isOpen) {
      // Fetch active meetings
      setMeetings([
        { id: '97963502-4cdb-49b9-903d-a5b4fcf6899f', title: 'Board Meeting', status: 'active' },
        { id: 'abc12345-1234-1234-1234-123456789abc', title: 'Committee Meeting', status: 'active' },
        { id: 'def67890-5678-5678-5678-567890abcdef', title: 'Special Session', status: 'active' }
      ]);

      // Fetch users
      setUsers([
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'John Smith', role: 'Chairman' },
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'Mary Johnson', role: 'Secretary' },
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'Sarah Johnson', role: 'Board Member' },
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'Mike Chen', role: 'Treasurer' },
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'Emily Davis', role: 'Board Member' },
        { id: '1cd2c440b0dc83a9dcb9f1ae49c88c63', name: 'Robert Brown', role: 'Board Member' }
      ]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 255) {
      errors.title = 'Title must not exceed 255 characters';
    }

    // Full text validation
    if (!formData.fullText.trim()) {
      errors.fullText = 'Motion text is required';
    } else if (formData.fullText.length < 10) {
      errors.fullText = 'Motion text must be at least 10 characters';
    }

    // Meeting validation
    if (!formData.meetingId) {
      errors.meetingId = 'Please select a meeting';
    }

    // Proposer validation
    if (!formData.proposerId) {
      errors.proposerId = 'Please select a proposer';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare request data
      const requestData = {
        title: formData.title.trim(),
        fullText: formData.fullText.trim(),
        meetingId: formData.meetingId,
        proposerId: formData.proposerId,
        // Only include seconderId if it has a value
        ...(formData.seconderId && { seconderId: formData.seconderId })
      };

      // Make API call
      const response = await fetch('http://localhost:8080/api/motions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          title: '',
          fullText: '',
          meetingId: '',
          proposerId: '',
          seconderId: ''
        });

        // Show success message briefly then close
        setTimeout(() => {
          onSuccess(data.motion);
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to create motion');
      }
    } catch (err) {
      console.error('Error creating motion:', err);
      setError('Network error: Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      fullText: '',
      meetingId: '',
      proposerId: '',
      seconderId: ''
    });
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Motion</h2>
              <p className="text-sm text-gray-500">Propose a motion for voting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Motion created successfully!</p>
                <p className="text-sm text-green-700">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Motion Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Motion Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Approve Budget Increase"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={255}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/255 characters (min 3, max 255)
              </p>
            </div>

            {/* Motion Text */}
            <div>
              <label htmlFor="fullText" className="block text-sm font-semibold text-gray-900 mb-2">
                Motion Text <span className="text-red-500">*</span>
              </label>
              <textarea
                id="fullText"
                name="fullText"
                value={formData.fullText}
                onChange={handleChange}
                placeholder="Motion to approve a 15% increase in the annual operating budget for fiscal year 2025-2026 to account for inflation and expanded operations."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  validationErrors.fullText ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.fullText && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullText}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.fullText.length} characters (min 10)
              </p>
            </div>

            {/* Meeting Selection */}
            <div>
              <label htmlFor="meetingId" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Meeting <span className="text-red-500">*</span>
                </div>
              </label>
              <select
                id="meetingId"
                name="meetingId"
                value={formData.meetingId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.meetingId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a meeting</option>
                {meetings.map(meeting => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title} ({meeting.status})
                  </option>
                ))}
              </select>
              {validationErrors.meetingId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.meetingId}</p>
              )}
            </div>

            {/* Proposer */}
            <div>
              <label htmlFor="proposerId" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Proposer <span className="text-red-500">*</span>
                </div>
              </label>
              <select
                id="proposerId"
                name="proposerId"
                value={formData.proposerId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.proposerId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select proposer</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
              {validationErrors.proposerId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.proposerId}</p>
              )}
            </div>

            {/* Seconder (Optional) */}
            <div>
              <label htmlFor="seconderId" className="block text-sm font-semibold text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seconder <span className="text-gray-400 font-normal">(Optional)</span>
                </div>
              </label>
              <select
                id="seconderId"
                name="seconderId"
                value={formData.seconderId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select seconder (optional)</option>
                {users
                  .filter(user => user.id !== formData.proposerId)
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                A seconder is not required but recommended for formal motions
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Created!
                </>
              ) : (
                'Create Motion'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMotionModal;