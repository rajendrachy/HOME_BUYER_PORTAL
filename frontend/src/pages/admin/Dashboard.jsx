import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import FilterBar from '../../components/FilterBar';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#6366F1', '#EF4444'];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'newest',
    page: 1,
    limit: 100
  });

  // User Management State
  const [userFilters, setUserFilters] = useState({ search: '', role: 'all', status: 'all' });
  const [userLoading, setUserLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(null);

  const fetchApplications = async (searchFilters) => {
    setLoading(true);
    try {
      const response = await api.getAllApplicationsWithFilters(searchFilters);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUserLoading(true);
    try {
      const { data } = await adminGetAllUsers(userFilters);
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (activeTab === 'applications') fetchApplications(filters);
      if (activeTab === 'users') loadUsers();
    }
  }, [authLoading, user, activeTab, filters, userFilters]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (userActionLoading) return;
    setUserActionLoading(userId);
    try {
      await adminUpdateUser(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setUserActionLoading(userId);
    try {
      await adminDeleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setUserActionLoading(null);
    }
  };

  // Derived Stats
  const stats = useMemo(() => {
    const s = {
      pending: 0, under_review: 0, approved: 0, bank_selected: 0, completed: 0, rejected: 0
    };
    applications.forEach(app => {
      if (s[app.status] !== undefined) s[app.status]++;
    });
    return s;
  }, [applications]);

  const chartData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Under Review', value: stats.under_review },
    { name: 'Approved', value: stats.approved },
    { name: 'Bank Selected', value: stats.bank_selected },
    { name: 'Completed', value: stats.completed },
    { name: 'Rejected', value: stats.rejected }
  ].filter(c => c.value > 0);

  // District Mapping (Mock coords for Nepal)
  const districtCoords = {
    'Kathmandu': [27.7172, 85.3240],
    'Lalitpur': [27.6644, 85.3188],
    'Bhaktapur': [27.6710, 85.4298],
    'Pokhara': [28.2096, 83.9856],
    'Biratnagar': [26.4525, 87.2717],
    'Chitwan': [27.5291, 84.3542]
  };

  const mapMarkers = useMemo(() => {
    const districts = {};
    applications.forEach(app => {
      const d = app.property?.district;
      if (d) districts[d] = (districts[d] || 0) + 1;
    });
    return Object.keys(districts).map(name => ({
      name,
      count: districts[name],
      coords: districtCoords[name] || [27.7, 85.3] // Fallback
    }));
  }, [applications]);

  const StatCard = ({ label, value, color }) => (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${color} hover:shadow-md transition cursor-default`}>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Hello, {user?.name}. Here is the system health report.</p>
          </div>
          <div className="text-right">
             <span className="text-xs text-gray-400 block font-mono">LIVE FEED</span>
             <span className="text-sm font-bold text-green-500 flex items-center justify-end">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
               System Online
             </span>
          </div>
        </header>

        {/* Tab Navigation (Glassmorphism look) */}
        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-sm mb-8 border border-gray-100 max-w-2xl">
          {['overview', 'applications', 'map', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Applications" value={applications.length} color="border-gray-900" />
              <StatCard label="Pending" value={stats.pending} color="border-yellow-500" />
              <StatCard label="Approved" value={stats.approved} color="border-green-500" />
              <StatCard label="Completed" value={stats.completed} color="border-blue-500" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Status Distribution</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Process Funnel</h3>
                <ResponsiveContainer width="100%" height="90%">
                   <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 h-[600px] overflow-hidden animate-in zoom-in-95 duration-300">
             <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '1.25rem' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mapMarkers.map((marker, idx) => (
                <Marker key={idx} position={marker.coords}>
                  <Popup>
                    <div className="p-1">
                       <h4 className="font-bold">{marker.name}</h4>
                       <p className="text-xs text-gray-500">{marker.count} Applications</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="animate-in slide-in-from-bottom-5 duration-300">
            <FilterBar 
              filters={filters} 
              onFilterChange={setFilters} 
              onReset={() => setFilters({
                status: 'all',
                search: '',
                sortBy: 'newest',
                page: 1,
                limit: 100
              })}
            />
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">District</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map(app => (
                    <tr key={app._id} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{app.applicationId}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{app.personalInfo?.fullName}</td>
                      <td className="px-6 py-4 text-gray-500">{app.property?.district}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => navigate(`/officer/application/${app._id}`)} className="text-blue-600 hover:underline font-bold text-sm">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* User filters */}
            <div className="grid md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              
              <select 
                className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizen</option>
                <option value="municipality_officer">Officer</option>
                <option value="bank_officer">Bank Officer</option>
                <option value="admin">Admin</option>
              </select>

              <select 
                className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={userFilters.status}
                onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated Only</option>
              </select>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-100">User Profile</th>
                      <th className="px-6 py-4 border-b border-gray-100">Access Level</th>
                      <th className="px-6 py-4 border-b border-gray-100">Member Since</th>
                      <th className="px-6 py-4 border-b border-gray-100">Account Status</th>
                      <th className="px-6 py-4 border-b border-gray-100 text-right">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userLoading ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium italic">Syncing user directory...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No users found matching your search criteria.</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg ${
                              u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                              u.role === 'bank_officer' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'municipality_officer' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                              disabled={userActionLoading === u._id}
                              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                                u.isActive 
                                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              } disabled:opacity-50`}
                            >
                              {userActionLoading === u._id ? 'Updating...' : (u.isActive ? 'Suspend' : 'Unsuspend')}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={userActionLoading === u._id || u.role === 'admin'}
                              className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

