import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, submitLoanOffer } from '../../services/api';

const SubmitOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '8.5',
    processingFee: '10000',
    tenure: '20',
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
      const suggestedLoan = data.application.property?.cost - (data.application.subsidyApproved || 0);
      setFormData(prev => ({
        ...prev,
        loanAmount: suggestedLoan.toString()
      }));
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateEMI = () => {
    const principal = parseFloat(formData.loanAmount);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const months = parseFloat(formData.tenure) * 12;
    
    if (isNaN(principal) || isNaN(rate) || isNaN(months) || principal <= 0) return 0;
    
    const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await submitLoanOffer(id, {
        loanAmount: parseFloat(formData.loanAmount),
        interestRate: parseFloat(formData.interestRate),
        processingFee: parseFloat(formData.processingFee),
        tenure: parseFloat(formData.tenure),
      });
      alert('Loan offer submitted successfully!');
      navigate('/bank/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !application) {
    return <div className="text-center py-10 text-red-500">{error || 'Application not found'}</div>;
  }

  const emi = calculateEMI();
  const propertyCost = application.property?.cost || 0;
  const subsidyApproved = application.subsidyApproved || 0;
  const remainingAmount = propertyCost - subsidyApproved;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/bank/dashboard')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">Submit Loan Offer</h1>
            <p className="text-gray-600">
              Application #{application.applicationId} - {application.personalInfo?.fullName}
            </p>
          </div>

          <div className="px-6 py-4 border-b bg-green-50">
            <h2 className="text-lg font-semibold mb-3">Application Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Property Cost</p>
                <p className="font-bold text-lg">NPR {propertyCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Government Subsidy</p>
                <p className="font-bold text-lg text-green-600">NPR {subsidyApproved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Loan Amount Needed</p>
                <p className="font-bold text-lg text-blue-600">NPR {remainingAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold mb-4">Loan Offer Details</h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Loan Amount (NPR) *</label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Suggested: NPR {remainingAmount.toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Processing Fee (NPR) *</label>
                <input
                  type="number"
                  name="processingFee"
                  value={formData.processingFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Tenure (Years) *</label>
                <select
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="10">10 Years</option>
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years</option>
                </select>
              </div>

              {emi > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Estimated Monthly EMI</p>
                  <p className="text-2xl font-bold text-blue-600">NPR {emi.toLocaleString()}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/bank/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitOffer;