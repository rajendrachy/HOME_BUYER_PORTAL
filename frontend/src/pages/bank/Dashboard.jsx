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

  // Get this bank's offer status for this application
  const getMyOfferStatus = (application) => {
    if (!user || !application.bankOffers) return null;
    
    // Find this specific bank's offer (not other banks)
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

  // Check if this bank has submitted an offer
  const hasSubmittedOffer = (application) => {
    return getMyOfferStatus(application) !== null;
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

  // Calculate statistics for THIS BANK only
  const stats = {
    total: applications.length,
    pending: applications.filter(app => !hasSubmittedOffer(app)).length,
    accepted: applications.filter(app => {
      const status = getMyOfferStatus(app);
      return status?.status === 'accepted';
    }).length,
    rejected: applications.filter(app => {
      const status = getMyOfferStatus(app);
      return status?.status === 'rejected';
    }).length,
    waiting: applications.filter(app => {
      const status = getMyOfferStatus(app);
      return status?.status === 'offered';
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getBankName()} Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Review applications and submit loan offers</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">No Offer Yet</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.waiting}</p>
            <p className="text-xs text-gray-500">Waiting Response</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-gray-500">Accepted</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
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
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Offer Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => {
                    const myOfferStatus = getMyOfferStatus(app);
                    const hasOffer = myOfferStatus !== null;
                    
                    return (
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
                          {!hasOffer ? (
                            // No offer submitted yet
                            <div className="flex gap-2">
                              <Link
                                to={`/bank/application/${app._id}`}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                              </Link>
                              <Link
                                to={`/bank/application/${app._id}/offer`}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Submit Offer
                              </Link>
                            </div>
                          ) : myOfferStatus.status === 'accepted' ? (
                            // ✅ Offer Accepted by Citizen
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accepted by {myOfferStatus.citizenName}
                              </span>
                              <div>
                                <Link
                                  to={`/bank/application/${app._id}`}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  View Details →
                                </Link>
                              </div>
                            </div>
                          ) : myOfferStatus.status === 'rejected' ? (
                            // ❌ Offer Rejected by Citizen - No View Details
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rejected by {myOfferStatus.citizenName}
                            </span>
                          ) : (
                            // ⏳ Offer Pending (waiting for citizen response)
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending Response
                              </span>
                              <div>
                                <Link
                                  to={`/bank/application/${app._id}`}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  View Details →
                                </Link>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
