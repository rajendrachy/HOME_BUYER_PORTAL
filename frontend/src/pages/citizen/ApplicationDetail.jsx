import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, acceptOffer } from '../../services/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to accept this bank offer?')) return;
    
    setAccepting(true);
    try {
      await acceptOffer(id, offerId);
      alert('Offer accepted successfully!');
      loadApplication(); // Reload to show updated status
    } catch (err) {
      alert('Failed to accept offer: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setAccepting(false);
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

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !application) {
    return <div className="text-center py-10 text-red-500">{error || 'Application not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Application #{application.applicationId}</h1>
              <span className={`${getStatusColor(application.status)} text-white px-3 py-1 rounded-full text-sm`}>
                {application.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Submitted: {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* Personal Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
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
              <div>
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
          
          {/* Subsidy Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Subsidy Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Subsidy Requested</p>
                <p className="font-medium">NPR {application.subsidyRequested?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Subsidy Approved</p>
                <p className={`font-medium ${application.subsidyApproved > 0 ? 'text-green-600' : ''}`}>
                  {application.subsidyApproved > 0 ? `NPR ${application.subsidyApproved.toLocaleString()}` : 'Pending'}
                </p>
              </div>
              {application.officerNotes && (
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm">Officer Notes</p>
                  <p className="font-medium text-gray-700">{application.officerNotes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bank Offers */}
          {application.bankOffers && application.bankOffers.length > 0 && (
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Bank Offers</h2>
              <div className="space-y-3">
                {application.bankOffers.map((offer, index) => (
                  <div key={offer._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{offer.bankName || 'Bank Offer'}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-gray-600 text-sm">Loan Amount</p>
                            <p className="font-medium">NPR {offer.loanAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Interest Rate</p>
                            <p className="font-medium">{offer.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Processing Fee</p>
                            <p className="font-medium">NPR {offer.processingFee?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Tenure</p>
                            <p className="font-medium">{offer.tenure} years</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Monthly EMI</p>
                            <p className="font-medium text-green-600">NPR {offer.emi?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm px-2 py-1 rounded ${
                          offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {offer.status?.toUpperCase()}
                        </span>
                        {offer.status === 'offered' && application.status !== 'bank_selected' && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleAcceptOffer(offer._id)}
                              disabled={accepting}
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              {accepting ? 'Accepting...' : 'Accept Offer'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-gray-500 text-sm text-center">
              Application ID: {application.applicationId} | Last Updated: {new Date(application.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
