import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../services/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data } = await getMyApplications();
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Link
            to="/citizen/submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + New Application
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No applications yet.</p>
            <Link to="/citizen/submit" className="text-blue-600 hover:underline mt-2 inline-block">
              Submit your first application
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Application #{app.applicationId}</h3>
                    <p className="text-gray-600 text-sm">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                    <p className="text-gray-700 mt-2">Property Cost: NPR {app.property?.cost?.toLocaleString()}</p>
                    {app.subsidyApproved > 0 && (
                      <p className="text-green-600 font-semibold">Subsidy: NPR {app.subsidyApproved.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`${getStatusColor(app.status)} text-white px-3 py-1 rounded-full text-sm`}>
                      {app.status?.toUpperCase()}
                    </span>
                    <div className="mt-2">
                      <Link
                        to={`/citizen/application/${app._id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
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

export default Dashboard;
