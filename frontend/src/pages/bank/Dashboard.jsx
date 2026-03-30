import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedApplications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import FilterBar from '../../components/FilterBar';
import { exportApplicationsToCSV } from '../../utils/export';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState({
    status: 'approved',
    district: 'all',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date_desc',
    limit: 10,
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const loadApplications = async () => {
    try {
      const { data } = await getApprovedApplications();
      setApplications(data.applications);
      // Extract unique districts
      const uniqueDistricts = [...new Set(data.applications.map(app => app.property?.district).filter(Boolean))];
      setDistricts(uniqueDistricts);
      setFilteredApplications(data.applications);
      setPagination({
        total: data.applications.length,
        page: 1,
        pages: Math.ceil(data.applications.length / filters.limit),
        limit: filters.limit
      });
    } catch (err) {
      setError('Failed to load approved applications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationId?.toLowerCase().includes(searchTerm) ||
        app.userId?.name?.toLowerCase().includes(searchTerm) ||
        app.userId?.email?.toLowerCase().includes(searchTerm)
      );
    }

    // District filter
    if (filters.district && filters.district !== 'all') {
      filtered = filtered.filter(app => app.property?.district === filters.district);
    }

    // Date range filter
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(app => new Date(app.submittedAt) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(app => new Date(app.submittedAt) <= end);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        break;
      case 'cost_asc':
        filtered.sort((a, b) => (a.property?.cost || 0) - (b.property?.cost || 0));
        break;
      case 'cost_desc':
        filtered.sort((a, b) => (b.property?.cost || 0) - (a.property?.cost || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    // Pagination
    const total = filtered.length;
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    const paginated = filtered.slice(start, end);

    setFilteredApplications(paginated);
    setPagination({
      total,
      page: filters.page,
      pages: Math.ceil(total / filters.limit),
      limit: filters.limit
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      alert('No data to export');
      return;
    }
    exportApplicationsToCSV(filteredApplications, 'bank_approved_applications');
  };

  // Get this bank's offer status for this application
  const getMyOfferStatus = (application) => {
    if (!user || !application.bankOffers) return null;
    
    const myOffer = application.bankOffers.find(offer => 
      (user.bankId && offer.bankId && offer.bankId.toString() === user.bankId.toString()) ||
      (user.bankName && offer.bankName === user.bankName) ||
      (user.name && offer.bankName === user.name)
    );
    
    if (!myOffer) return null;
    
    return {
      status: myOffer.status,
      citizenName: application.userId?.name || 'Citizen',
      applicationId: application.applicationId
    };
  };

  const hasSubmittedOffer = (application) => {
    return getMyOfferStatus(application) !== null;
  };

  const getBankName = () => {
    if (user?.bankName) return user.bankName;
    if (user?.name) return user.name;
    return 'Bank Officer';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading approved applications...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => !hasSubmittedOffer(app)).length,
    accepted: applications.filter(app => getMyOfferStatus(app)?.status === 'accepted').length,
    rejected: applications.filter(app => getMyOfferStatus(app)?.status === 'rejected').length,
    waiting: applications.filter(app => getMyOfferStatus(app)?.status === 'offered').length
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getBankName()} Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Review applications and submit loan offers</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/bank/offers"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View My Offers
            </Link>
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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">No Offer Yet</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.waiting}</p>
            <p className="text-xs text-gray-500">Waiting Response</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-gray-500">Accepted</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          districts={districts}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredApplications.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> approved applications
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-5xl mb-4">🏦</div>
              <p className="text-gray-500">No approved applications found</p>
              <button
                onClick={() => handleFilterChange({
                  status: 'approved',
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
            filteredApplications.map((app) => {
              const myOfferStatus = getMyOfferStatus(app);
              const hasOffer = myOfferStatus !== null;
              
              return (
                <div key={app._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{app.applicationId}</p>
                      <p className="text-sm text-gray-600">{app.userId?.name}</p>
                    </div>
                    {!hasOffer ? (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">No Offer</span>
                    ) : myOfferStatus.status === 'accepted' ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Accepted</span>
                    ) : myOfferStatus.status === 'rejected' ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Rejected</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Pending</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Property Cost</p>
                      <p className="font-medium">NPR {app.property?.cost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Subsidy</p>
                      <p className="font-medium text-green-600">NPR {app.subsidyApproved?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/bank/application/${app._id}`}
                      className="flex-1 text-center bg-gray-600 text-white py-2 rounded-lg text-sm hover:bg-gray-700"
                    >
                      View Details
                    </Link>
                    {!hasOffer && (
                      <Link
                        to={`/bank/application/${app._id}/offer`}
                        className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Submit Offer
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Applications Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search.</p>
              <button
                onClick={() => handleFilterChange({
                  status: 'approved',
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
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Cost</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subsidy</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Offer Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => {
                      const myOfferStatus = getMyOfferStatus(app);
                      const hasOffer = myOfferStatus !== null;
                      
                      return (
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              NPR {app.subsidyApproved?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {!hasOffer ? (
                              <span className="text-gray-500 text-sm">No offer yet</span>
                            ) : myOfferStatus.status === 'accepted' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                                ✅ Accepted by {myOfferStatus.citizenName}
                              </span>
                            ) : myOfferStatus.status === 'rejected' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                                ❌ Rejected by {myOfferStatus.citizenName}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">
                                ⏳ Pending Response
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex gap-2">
                              <Link
                                to={`/bank/application/${app._id}`}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                              >
                                View
                              </Link>
                              {!hasOffer && (
                                <Link
                                  to={`/bank/application/${app._id}/offer`}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  Offer
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

