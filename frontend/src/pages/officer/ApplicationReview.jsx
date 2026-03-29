import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, updateApplicationStatus } from '../../services/api';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: 'approved',
    subsidyApproved: '',
    officerNotes: ''
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
      setFormData({
        status: data.application.status,
        subsidyApproved: data.application.subsidyApproved || '',
        officerNotes: data.application.officerNotes || ''
      });
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await updateApplicationStatus(id, {
        status: formData.status,
        subsidyApproved: parseInt(formData.subsidyApproved),
        officerNotes: formData.officerNotes
      });
      alert('Application status updated successfully!');
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'under_review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'bank_selected': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get API URL for document links
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !application) {
    return <div className="text-center py-10 text-red-500">{error || 'Application not found'}</div>;
  }

  const maxSubsidy = application.property?.cost * 0.15; // Max 15% of property cost

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/officer/dashboard')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Review Application #{application.applicationId}</h1>
              <span className={`${getStatusColor(application.status)} text-white px-3 py-1 rounded-full text-sm`}>
                {application.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Applicant: {application.personalInfo?.fullName} | Submitted: {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Applicant Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Applicant Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="font-medium">{application.personalInfo?.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Citizenship Number</p>
                <p className="font-medium">{application.personalInfo?.citizenshipNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{application.personalInfo?.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{application.personalInfo?.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">Address</p>
                <p className="font-medium">{application.personalInfo?.currentAddress}</p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Employment Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Employment Type</p>
                <p className="font-medium capitalize">{application.employment?.type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Monthly Income</p>
                <p className="font-medium">NPR {application.employment?.monthlyIncome?.toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">Employer</p>
                <p className="font-medium">{application.employment?.employerName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Property Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{application.property?.district}, {application.property?.municipality}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ward</p>
                <p className="font-medium">{application.property?.ward}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Property Type</p>
                <p className="font-medium capitalize">{application.property?.type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Property Cost</p>
                <p className="font-medium">NPR {application.property?.cost?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Family Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Family Members</p>
                <p className="font-medium">{application.family?.members}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Dependents</p>
                <p className="font-medium">{application.family?.dependents || 0}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm">Spouse Name</p>
                <p className="font-medium">{application.family?.spouseName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Subsidy Request */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Subsidy Request</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Subsidy Requested</p>
                <p className="font-medium">NPR {application.subsidyRequested?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Max Possible Subsidy (15%)</p>
                <p className="font-medium text-blue-600">NPR {Math.floor(maxSubsidy).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ✅ Uploaded Documents Section */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">📁 Uploaded Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Citizenship Document */}
              {application.citizenshipDocument ? (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🪪</span>
                    <span className="font-medium text-sm">Citizenship</span>
                  </div>
                  <a
                    href={`${apiUrl}${application.citizenshipDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Document
                  </a>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {application.citizenshipDocument.split('/').pop()}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50 text-center text-gray-400">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm">Citizenship<br/>Not Uploaded</p>
                </div>
              )}

              {/* Income Proof Document */}
              {application.incomeProofDocument ? (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="font-medium text-sm">Income Proof</span>
                  </div>
                  <a
                    href={`${apiUrl}${application.incomeProofDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Document
                  </a>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {application.incomeProofDocument.split('/').pop()}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50 text-center text-gray-400">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm">Income Proof<br/>Not Uploaded</p>
                </div>
              )}

              {/* Property Document */}
              {application.propertyDocument ? (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏠</span>
                    <span className="font-medium text-sm">Property Doc</span>
                  </div>
                  <a
                    href={`${apiUrl}${application.propertyDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Document
                  </a>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {application.propertyDocument.split('/').pop()}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50 text-center text-gray-400">
                  <span className="text-2xl">📄</span>
                  <p className="text-sm">Property Doc<br/>Not Uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold mb-4">Review Decision</h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Subsidy Approved (NPR)
                </label>
                <input
                  type="number"
                  name="subsidyApproved"
                  value={formData.subsidyApproved}
                  onChange={handleChange}
                  placeholder="Enter approved subsidy amount"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum possible: NPR {Math.floor(maxSubsidy).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Officer Notes</label>
                <textarea
                  name="officerNotes"
                  value={formData.officerNotes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add your notes and reasoning here..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/officer/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;