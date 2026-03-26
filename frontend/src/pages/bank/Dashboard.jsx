import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedApplications } from '../../services/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bank Officer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsidy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app._id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.applicationId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.userId?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">NPR {app.property?.cost?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                    NPR {app.subsidyApproved?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
  to={`/bank/application/${app._id}/offer`}
  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
>
  Submit Offer
</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
