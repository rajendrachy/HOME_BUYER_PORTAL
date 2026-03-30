import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../services/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data } = await getMyApplications();
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'bank_selected': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'bank_selected': return 'Bank Selected';
      default: return status;
    }
  };

  // Filter and sort applications
  const getFilteredApplications = () => {
    let filtered = [...applications];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        break;
      case 'highest_cost':
        filtered.sort((a, b) => (b.property?.cost || 0) - (a.property?.cost || 0));
        break;
      case 'lowest_cost':
        filtered.sort((a, b) => (a.property?.cost || 0) - (b.property?.cost || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    bankSelected: applications.filter(a => a.status === 'bank_selected').length,
    totalSubsidy: applications.reduce((sum, a) => sum + (a.subsidyApproved || 0), 0)
  };

  // Calculate completion percentage
  const completionPercentage = stats.total > 0 ? (stats.bankSelected / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Track and manage your subsidy applications</p>
          </div>
          <Link
            to="/citizen/submit"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Application
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs opacity-90">Total Apps</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs opacity-90">Pending</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-xs opacity-90">Approved</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-2xl font-bold">{stats.rejected}</p>
            <p className="text-xs opacity-90">Rejected</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-2xl font-bold">{stats.bankSelected}</p>
            <p className="text-xs opacity-90">Bank Selected</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-3 text-white">
            <p className="text-xl font-bold">NPR {stats.totalSubsidy.toLocaleString()}</p>
            <p className="text-xs opacity-90">Total Subsidy</p>
          </div>
        </div>

        {/* Progress Tracker */}
        {stats.total > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Application Progress</h3>
              <span className="text-sm text-gray-500">{Math.round(completionPercentage)}% Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Submitted</span>
              <span>Approved</span>
              <span>Bank Selected</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search and Filter Bar */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Application ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="bank_selected">Bank Selected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_cost">Highest Cost</option>
                <option value="lowest_cost">Lowest Cost</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('newest');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {applications.length > 0 && (
          <p className="text-sm text-gray-500 mb-3">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">Try adjusting your filters or submit a new application.</p>
            <Link to="/citizen/submit" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + New Application
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-5">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{app.applicationId}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-gray-500 text-xs">Property Cost</p>
                          <p className="font-semibold text-gray-900">NPR {app.property?.cost?.toLocaleString()}</p>
                        </div>
                        {app.subsidyApproved > 0 && (
                          <div>
                            <p className="text-gray-500 text-xs">Subsidy Approved</p>
                            <p className="font-semibold text-green-600">NPR {app.subsidyApproved.toLocaleString()}</p>
                          </div>
                        )}
                        {app.selectedBankId && (
                          <div>
                            <p className="text-gray-500 text-xs">Selected Bank</p>
                            <p className="font-semibold text-purple-600">
                              {app.bankOffers?.find(o => o.status === 'accepted')?.bankName || 'Bank Selected'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/citizen/application/${app._id}`}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1 self-center"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;