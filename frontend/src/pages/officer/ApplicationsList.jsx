import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllApplicationsWithFilters } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AdvancedSearch from '../../components/AdvancedSearch';

const ApplicationsList = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    if (!authLoading && user) {
      fetchApplications();
    }
  }, [authLoading, user, filters]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAllApplicationsWithFilters(filters);
      setApplications(data.applications || []);
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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      bank_selected: 'bg-purple-100 text-purple-800',
      completed: 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      under_review: '🔍',
      approved: '✅',
      rejected: '❌',
      bank_selected: '🏦',
      completed: '🎉'
    };
    return icons[status] || '📋';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'municipality_officer' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-red-600">You don't have permission to access this page.</p>
            <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
            <p className="text-gray-600 mt-1">Manage and review home buyer applications</p>
          </div>
          <Link
            to="/officer/dashboard"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Advanced Search Interface */}
        <AdvancedSearch 
          filters={filters} 
          onFilterChange={handleFilterChange}
          districts={districts}
        />

        {/* Results Info */}
        {!loading && (
          <div className="text-sm text-gray-600 mt-4 mb-4">
            Showing <span className="font-semibold">{applications.length}</span> of <span className="font-semibold">{pagination.total}</span> applications
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          </div>
        )}

        {/* Applications Table */}
        {!loading && applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">Try adjusting your filters to find applications.</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Application</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applicant</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property Value</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-blue-600">
                        <Link to={`/officer/review/${app._id}`} className="hover:underline">
                          {app.applicationId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{app.personalInfo?.fullName}</p>
                        <p className="text-sm text-gray-500">{app.personalInfo?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1 ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)} {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        NPR {(app.property?.cost || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/officer/review/${app._id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {applications.map(app => (
                <div key={app._id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link to={`/officer/review/${app._id}`}  className="text-blue-600 hover:underline font-semibold">
                        {app.applicationId}
                      </Link>
                      <p className="text-sm text-gray-600">{app.personalInfo?.fullName}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)} {app.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="text-gray-600">Property:</span> NPR {(app.property?.cost || 0).toLocaleString()}</p>
                    <p><span className="text-gray-600">Submitted:</span> {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link
                    to={`/officer/review/${app._id}`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Review Application →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg border transition ${
                  pagination.page === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
