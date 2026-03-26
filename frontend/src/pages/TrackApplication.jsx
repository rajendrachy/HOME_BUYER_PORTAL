import React, { useState } from 'react';
import { trackApplication } from '../services/api';

const TrackApplication = () => {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const { data } = await trackApplication(applicationId);
      setApplication(data.application);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Application</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Application ID</label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g., APP-2026-03218"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Application'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {application && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Application Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Application ID:</span>
                  <span>{application.applicationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`${getStatusColor(application.status)} text-white px-2 py-1 rounded text-sm`}>
                    {application.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Submitted Date:</span>
                  <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Property Cost:</span>
                  <span>NPR {application.property?.cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subsidy Requested:</span>
                  <span>NPR {application.subsidyRequested?.toLocaleString()}</span>
                </div>
                {application.subsidyApproved > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Subsidy Approved:</span>
                    <span>NPR {application.subsidyApproved?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackApplication;
