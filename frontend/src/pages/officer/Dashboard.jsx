import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllApplicationsWithFilters } from '../../services/api';
import FilterBar from '../../components/FilterBar';
import { exportApplicationsToCSV } from '../../utils/export';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [districts, setDistricts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    status: 'all',
    district: 'all',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date_desc',
    limit: 10,
    page: 1
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getAllApplicationsWithFilters(filters);
      setApplications(data.applications);
      setPagination({
        total: data.total,
        page: data.page,
        pages: data.pages,
        limit: filters.limit
      });
      if (data.filters?.districts) {
        setDistricts(data.filters.districts);
      }
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert('No data to export');
      return;
    }
    exportApplicationsToCSV(applications, 'applications');
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

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics from current filtered results
  const stats = {
    total: pagination.total,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    bankSelected: applications.filter(a => a.status === 'bank_selected').length
  };

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#eab308' },
    { name: 'Approved', value: stats.approved, color: '#22c55e' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Bank Selected', value: stats.bankSelected, color: '#a855f7' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Municipality Officer Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Review and manage subsidy applications</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
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

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          districts={districts}
        />

        {/* Analytics Chart */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center mb-6">
            <h3 className="font-semibold text-gray-800 w-full text-left">Current View Statistics</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{applications.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> applications
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500">No applications found</p>
              <button
                onClick={() => handleFilterChange({
                  status: 'all',
                  district: 'all',
                  startDate: '',
                  endDate: '',
                  search: '',
                  sortBy: 'date_desc',
                  limit: 10,
                  page: 1
                })}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
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

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search.</p>
              <button
                onClick={() => handleFilterChange({
                  status: 'all',
                  district: 'all',
                  startDate: '',
                  endDate: '',
                  search: '',
                  sortBy: 'date_desc',
                  limit: 10,
                  page: 1
                })}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
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

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4 border-t">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
