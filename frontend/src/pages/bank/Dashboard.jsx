import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedApplications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data } = await getApprovedApplications();
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to load approved applications');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Improved function to check if this bank already submitted an offer
  const hasSubmittedOffer = (application) => {
    if (!user || !application.bankOffers) return false;
    
    // Check by bank ID (most reliable - for new users)
    if (user.bankId) {
      const matched = application.bankOffers.some(offer => 
        offer.bankId && offer.bankId.toString() === user.bankId.toString()
      );
      if (matched) return true;
    }
    
    // Check by bank name (for users with bankName set)
    if (user.bankName) {
      const matched = application.bankOffers.some(offer => 
        offer.bankName === user.bankName
      );
      if (matched) return true;
    }
    
    // Check by officer name (fallback for old data)
    if (user.name) {
      const matched = application.bankOffers.some(offer => 
        offer.bankName === user.name
      );
      if (matched) return true;
    }
    
    return false;
  };

  // Get bank name to display in header
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
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: applications.length,
    submitted: applications.filter(app => hasSubmittedOffer(app)).length,
    pending: applications.filter(app => !hasSubmittedOffer(app)).length
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getBankName()} Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Submit loan offers for approved applications</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.submitted}</p>
            <p className="text-xs text-gray-500">Offers Sent</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Applications</h3>
            <p className="text-gray-500">There are no approved applications waiting for loan offers.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Cost</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsidy</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{app.applicationId}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.userId?.name}</p>
                          <p className="text-xs text-gray-500">{app.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm text-gray-900">NPR {app.property?.cost?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          NPR {app.subsidyApproved?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {hasSubmittedOffer(app) ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Offer Submitted
                          </span>
                        ) : (
                          <Link
                            to={`/bank/application/${app._id}/offer`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Offer
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

