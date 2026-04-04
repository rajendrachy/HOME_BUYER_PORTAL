import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApplicationById } from '../../services/api';
import { getFileUrl, getDocPreviewUrl } from '../../utils/fileConfig';

const BankApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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


  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !application) {
    return <div className="text-center py-10 text-red-500">{error || 'Application not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate('/bank/dashboard')} className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </button>
          <Link to={`/bank/application/${id}/offer`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit Offer →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">Application #{application.applicationId}</h1>
            <p className="text-gray-600">Applicant: {application.personalInfo?.fullName}</p>
          </div>

          {/* Personal Info */}
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold mb-2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <p>Name: {application.personalInfo?.fullName}</p>
              <p>Phone: {application.personalInfo?.phone}</p>
              <p>Email: {application.personalInfo?.email}</p>
            </div>
          </div>

          {/* Property Info */}
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold mb-2">Property Information</h2>
            <p>Location: {application.property?.district}, {application.property?.municipality}</p>
            <p>Cost: NPR {application.property?.cost?.toLocaleString()}</p>
            <p className="text-green-600 font-bold">Subsidy Approved: NPR {application.subsidyApproved?.toLocaleString()}</p>
            <p className="text-blue-600 font-bold">Loan Needed: NPR {(application.property?.cost - application.subsidyApproved).toLocaleString()}</p>
          </div>

          {/* Documents */}
          <div className="px-6 py-4">
            <h2 className="font-semibold mb-2">Documents</h2>
            <div className="space-y-2">
              {application.citizenshipDocument && <a href={getDocPreviewUrl(application.citizenshipDocument)} target="_blank" className="text-blue-600 block">📄 Citizenship Certificate</a>}
              {application.incomeProofDocument && <a href={getDocPreviewUrl(application.incomeProofDocument)} target="_blank" className="text-blue-600 block">📄 Income Proof</a>}
              {application.propertyDocument && <a href={getDocPreviewUrl(application.propertyDocument)} target="_blank" className="text-blue-600 block">📄 Property Document</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankApplicationDetail;
