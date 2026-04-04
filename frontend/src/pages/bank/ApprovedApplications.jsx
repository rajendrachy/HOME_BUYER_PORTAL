import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedApplications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ApprovedApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useAuth();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data } = await getApprovedApplications();
      setApplications(data.applications || []);
    } catch (err) {
      setError('Failed to load approved applications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFiltered = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.applicationId.toLowerCase().includes(search) ||
        app.personalInfo?.fullName.toLowerCase().includes(search) ||
        app.personalInfo?.email.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'high_subsidy':
        filtered.sort((a, b) => b.subsidyApproved - a.subsidyApproved);
        break;
      case 'high_property':
        filtered.sort((a, b) => (b.property?.cost || 0) - (a.property?.cost || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredApplications = getFiltered();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Approved Applications</h1>
          <p className="text-gray-600 mt-1">Ready to submit loan offers</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Application ID or applicant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="high_property">Highest Property Cost</option>
                <option value="high_subsidy">Highest Subsidy</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearchTerm(''); setSortBy('newest'); }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="text-sm text-gray-600 mb-4">
          Showing <span className="font-semibold">{filteredApplications.length}</span> of <span className="font-semibold">{applications.length}</span> applications
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Applications</h3>
            <p className="text-gray-500">No applications ready for loan offers at this moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link to={`/bank/submit-offer/${app._id}`} className="text-blue-600 hover:underline">
                          Application #{app.applicationId}
                        </Link>
                      </h3>
                      <p className="text-gray-600">Applicant: {app.personalInfo?.fullName}</p>
                      <p className="text-sm text-gray-500">Email: {app.personalInfo?.email}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✅ APPROVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                    <div>
                      <p className="text-gray-600 text-sm">Property Cost</p>
                      <p className="font-semibold">NPR {(app.property?.cost || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Subsidy Approved</p>
                      <p className="font-semibold text-green-600">NPR {(app.subsidyApproved || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">District</p>
                      <p className="font-semibold">{app.property?.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Submitted</p>
                      <p className="font-semibold">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link
                      to={`/bank/submit-offer/${app._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      📋 Submit Loan Offer
                    </Link>
                    <Link
                      to={`/applications/${app._id}`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      👁️ View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedApplications;
