import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllApplications } from '../../services/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data } = await getAllApplications();
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to load applications');
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

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'bank_selected': return 'Bank Selected';
      default: return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    bankSelected: applications.filter(a => a.status === 'bank_selected').length
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Municipality Officer Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Review and manage subsidy applications</p>
        </div>

        {/* Statistics Cards - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.bankSelected}</p>
            <p className="text-xs text-gray-500">Bank Selected</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Mobile Card View (for small screens) */}
        <div className="block sm:hidden space-y-3">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{app.applicationId}</p>
                    <p className="text-sm text-gray-600">{app.userId?.name}</p>
                  </div>
                  <span className={`${getStatusColor(app.status)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                    {getStatusText(app.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Property Cost</p>
                    <p className="font-medium text-sm">NPR {app.property?.cost?.toLocaleString()}</p>
                  </div>
                  {app.subsidyApproved > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs">Subsidy</p>
                      <p className="font-medium text-sm text-green-600">NPR {app.subsidyApproved?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <Link
                  to={`/officer/application/${app._id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Review Application →
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (for larger screens) */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
              <p className="text-gray-500">No applications to review at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Cost</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{app.applicationId}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.userId?.name}</p>
                          <p className="text-xs text-gray-500">{app.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">NPR {app.property?.cost?.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`${getStatusColor(app.status)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Link
                          to={`/officer/application/${app._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;