import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, acceptOffer } from '../../services/api';
import { generateApplicationPDF } from '../../utils/pdfGenerator';
import { getFileUrl, getDocPreviewUrl } from '../../utils/fileConfig';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);

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
      loadApplication();
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
    return <div className="text-center py-10">Loading application details...</div>;
  }

  if (error || !application) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'Application not found'}</p>
        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Application #{application.applicationId}</h1>
                <span className={`${getStatusColor(application.status)} text-white px-3 py-1 rounded-full text-sm`}>
                  {application.status?.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => generateApplicationPDF(application)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
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
                <p className="font-medium">{application.personalInfo?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Citizenship Number</p>
                <p className="font-medium">{application.personalInfo?.citizenshipNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{application.personalInfo?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{application.personalInfo?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Employment Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Employment Type</p>
                <p className="font-medium capitalize">{application.employment?.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Monthly Income</p>
                <p className="font-medium">NPR {application.employment?.monthlyIncome?.toLocaleString() || '0'}</p>
              </div>
              <div className="md:col-span-2">
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
                <p className="font-medium">{application.property?.district || 'N/A'}, {application.property?.municipality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ward</p>
                <p className="font-medium">{application.property?.ward || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Property Type</p>
                <p className="font-medium capitalize">{application.property?.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Property Cost</p>
                <p className="font-medium">NPR {application.property?.cost?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          {/* Subsidy Information */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Subsidy Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Subsidy Requested</p>
                <p className="font-medium">NPR {application.subsidyRequested?.toLocaleString() || '0'}</p>
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

          {/* Uploaded Documents Section */}
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold mb-3">📁 Uploaded Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🪪</span>
                  <span className="font-medium text-sm">Citizenship</span>
                </div>
                {application.citizenshipDocument ? (
                  <button
                    onClick={() => {
                      setPreviewUrl(getDocPreviewUrl(application.citizenshipDocument));
                      setRawPreviewUrl(getFileUrl(application.citizenshipDocument));
                    }}
                    className="text-blue-600 hover:underline text-sm font-medium w-full text-left"
                  >
                    View Document 👀
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">Not uploaded</p>
                )}
              </div>

              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-medium text-sm">Income Proof</span>
                </div>
                {application.incomeProofDocument ? (
                  <button
                    onClick={() => {
                      setPreviewUrl(getDocPreviewUrl(application.incomeProofDocument));
                      setRawPreviewUrl(getFileUrl(application.incomeProofDocument));
                    }}
                    className="text-blue-600 hover:underline text-sm font-medium w-full text-left"
                  >
                    View Document 👀
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">Not uploaded</p>
                )}
              </div>

              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏠</span>
                  <span className="font-medium text-sm">Property Doc</span>
                </div>
                {application.propertyDocument ? (
                  <button
                    onClick={() => {
                      setPreviewUrl(getDocPreviewUrl(application.propertyDocument));
                      setRawPreviewUrl(getFileUrl(application.propertyDocument));
                    }}
                    className="text-blue-600 hover:underline text-sm font-medium w-full text-left"
                  >
                    View Document 👀
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">Not uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Offers */}
          {application.bankOffers && application.bankOffers.length > 0 && (
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Bank Offers</h2>
              <div className="space-y-3">
                {application.bankOffers.map((offer) => (
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

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Document Preview
              </h3>
              <div className="flex gap-3">
                <a 
                  href={rawPreviewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition"
                >
                  Open in New Tab
                </a>
                <button 
                  onClick={() => setPreviewUrl(null)} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200">
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title="Document Preview" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;


