import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadMyOffers();
  }, []);

  const loadMyOffers = async () => {
    try {
      const { data } = await api.get('/applications/my-offers');
      setOffers(data.offers);
    } catch (err) {
      setError('Failed to load your offers');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
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
          <p className="mt-3 text-gray-600">Loading your offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getBankName()} - My Offers</h1>
              <p className="text-gray-600 text-sm mt-1">Track all loan offers you have submitted</p>
            </div>
            <Link
              to="/bank/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Yet</h3>
            <p className="text-gray-500">You haven't submitted any loan offers yet.</p>
            <Link to="/bank/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.applicationId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">Application #{offer.applicationId}</h3>
                      <p className="text-gray-600 mt-1">Applicant: {offer.applicantName}</p>
                      {offer.offerDetails.status === 'accepted' && (
                        <p className="text-green-600 text-sm mt-1">
                          📞 Contact: {offer.applicantPhone} | ✉️ {offer.applicantEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      {offer.offerDetails.status === 'accepted' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✅ ACCEPTED
                        </span>
                      )}
                      {offer.offerDetails.status === 'rejected' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          ❌ REJECTED
                        </span>
                      )}
                      {offer.offerDetails.status === 'offered' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          ⏳ PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Property Cost</p>
                      <p className="font-medium">NPR {offer.propertyCost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Government Subsidy</p>
                      <p className="font-medium text-green-600">NPR {offer.subsidyApproved?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Your Loan Amount</p>
                      <p className="font-medium">NPR {offer.offerDetails.loanAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Interest Rate</p>
                      <p className="font-medium">{offer.offerDetails.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Tenure</p>
                      <p className="font-medium">{offer.offerDetails.tenure} years</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Monthly EMI</p>
                      <p className="font-medium text-blue-600">NPR {offer.offerDetails.emi?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Processing Fee</p>
                      <p className="font-medium">NPR {offer.offerDetails.processingFee?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Submitted On</p>
                      <p className="font-medium text-sm">{new Date(offer.offerDetails.offeredAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Accepted Offer Message */}
                  {offer.offerDetails.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎉</span>
                        <div>
                          <p className="text-green-700 font-medium">Congratulations! This customer accepted your offer!</p>
                          <p className="text-green-600 text-sm mt-1">
                            <strong>Customer Details:</strong><br />
                            Name: {offer.applicantName}<br />
                            Phone: {offer.applicantPhone}<br />
                            Email: {offer.applicantEmail}
                          </p>
                          <p className="text-green-600 text-sm mt-2">
                            Please contact the customer to complete the loan process.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejected Offer Message */}
                  {offer.offerDetails.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📢</span>
                        <div>
                          <p className="text-red-700 font-medium">This customer rejected your offer.</p>
                          <p className="text-red-600 text-sm mt-1">
                            They selected another bank's offer. You can still review the application details below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Offer Message */}
                  {offer.offerDetails.status === 'offered' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                          <p className="text-yellow-700 font-medium">Waiting for customer response.</p>
                          <p className="text-yellow-600 text-sm mt-1">
                            The customer is reviewing your offer. You will be notified when they make a decision.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Details Link - FIXED: Using public track page */}
                  <div className="mt-4 pt-3 border-t">
                    <Link
                      to={`/track/${offer.applicationId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                      target="_blank"
                    >
                      View Full Application Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Opens in new tab - public tracking view</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        {offers.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{offers.length}</p>
              <p className="text-sm text-gray-500">Total Offers</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {offers.filter(o => o.offerDetails.status === 'accepted').length}
              </p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {offers.filter(o => o.offerDetails.status === 'offered').length}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;

