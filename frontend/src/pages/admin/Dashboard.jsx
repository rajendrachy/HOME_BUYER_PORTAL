import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { adminGetAllUsers, adminUpdateUser, adminDeleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, FileText, Map as MapIcon, 
  LayoutDashboard, Activity, Search, Filter, 
  Trash2, UserX, UserCheck, ChevronRight, 
  TrendingUp, Globe, Database, Settings
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({ status: 'all', search: '', sortBy: 'newest', page: 1, limit: 100 });
  const [userFilters, setUserFilters] = useState({ search: '', role: 'all', status: 'all' });
  const [userActionLoading, setUserActionLoading] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (activeTab === 'overview' || activeTab === 'applications' || activeTab === 'map') fetchApplications(filters);
      if (activeTab === 'users') loadUsers();
    }
  }, [authLoading, user, activeTab, filters, userFilters]);

  const fetchApplications = async (searchFilters) => {
    setLoading(true);
    try {
      const response = await api.getAllApplicationsWithFilters(searchFilters);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError('Operational error: Secure database access failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetAllUsers(userFilters);
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Identity Directory error: Synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setUserActionLoading(userId);
    try {
      await adminUpdateUser(userId, { isActive: !currentStatus });
      toast.success(`Access level adjusted for UID: ${userId.slice(-6)}`);
      loadUsers();
    } catch (err) {
      toast.error('Identity update rejected by system.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    const s = { pending: 0, under_review: 0, approved: 0, bank_selected: 0, completed: 0, rejected: 0 };
    applications.forEach(app => { if (s[app.status] !== undefined) s[app.status]++; });
    return s;
  }, [applications]);

  const chartData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Verification', value: stats.under_review },
    { name: 'Secured', value: stats.approved },
    { name: 'Integrated', value: stats.bank_selected },
    { name: 'Completed', value: stats.completed }
  ].filter(c => c.value > 0);

  const mapMarkers = useMemo(() => {
    const districts = {};
    applications.forEach(app => {
      const d = app.property?.district;
      if (d) districts[d] = (districts[d] || 0) + 1;
    });
    return Object.keys(districts).map(name => ({
      name, count: districts[name], coords: [27.7172, 85.3240] // Simplified coords for demo
    }));
  }, [applications]);

  if (loading && applications.length === 0 && users.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Initializing Command Center</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">System Administrator</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                 Command Room.
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Real-time surveillance of national housing subsidies and identity management.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mainframe Link Active</span>
              </div>
           </motion.div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex bg-white border border-slate-100 p-1.5 rounded-[2rem] shadow-sm mb-12 max-w-3xl overflow-x-auto no-scrollbar">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'National Overview' },
             { id: 'applications', icon: FileText, label: 'Record Ledger' },
             { id: 'map', icon: Globe, label: 'Geospatial Audit' },
             { id: 'users', icon: Users, label: 'Identity Directory' }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                 activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
               }`}
             >
               <tab.icon size={16} />
               {tab.label}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                 {/* Top Level Metrics */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { l: "Total Records", v: applications.length, i: Database, c: "text-slate-900" },
                      { l: "Verification Funnel", v: stats.pending, i: Activity, c: "text-amber-600" },
                      { l: "Total Approved", v: stats.approved, i: TrendingUp, c: "text-emerald-600" },
                      { l: "Active Users", v: users.length || 0, i: Users, c: "text-indigo-600" }
                    ].map((m, i) => (
                       <div key={i} className="bg-white p-10 border border-slate-100 rounded-[3rem] shadow-sm group hover:shadow-xl transition-all duration-500">
                          <div className={`w-12 h-12 ${m.c} bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform`}>
                             <m.i size={24} />
                          </div>
                          <h3 className={`text-4xl font-black ${m.c} mb-2 tracking-tighter`}>{m.v}</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{m.l}</p>
                       </div>
                    ))}
                 </div>

                 {/* Visualization Layer */}
                 <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
                       <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-widest">National Status Distribution</h3>
                       <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value">
                                   {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
                       <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-widest">Process Throughput</h3>
                       <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontStyle="bold" tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} fontStyle="bold" tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                                   {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                 <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                       <input
                         type="text"
                         placeholder="Filter identity ledger..."
                         value={userFilters.search}
                         onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                         className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-medium text-slate-900 border border-transparent focus:border-slate-100 transition-all"
                       />
                    </div>
                    <select className="px-8 py-4 bg-slate-50/50 rounded-xl font-black text-slate-900 text-[10px] uppercase tracking-widest border-none cursor-pointer">
                       <option>All Permissions</option>
                       <option>Citizens Only</option>
                       <option>State Officers</option>
                    </select>
                 </div>

                 <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Profile</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Access Tier</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Operational Control</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {users.map((u, i) => (
                             <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm uppercase">
                                         {u.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">{u.name}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-8">
                                   <span className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                      {u.role.replace('_', ' ')}
                                   </span>
                                </td>
                                <td className="px-10 py-8">
                                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">{u.isActive ? 'Verified' : 'Suspended'}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-right space-x-3">
                                   <button 
                                      onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all"
                                   >
                                      {u.isActive ? <UserX size={14} className="inline mr-2" /> : <UserCheck size={14} className="inline mr-2" />}
                                      Toggle Access
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
           )}

           {activeTab === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-4 rounded-[4rem] border border-slate-100 shadow-xl h-[700px] overflow-hidden relative">
                 <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '3rem' }} className="z-0">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {mapMarkers.map((marker, idx) => (
                       <Marker key={idx} position={marker.coords}>
                          <Popup>
                             <div className="p-4">
                                <h4 className="font-black text-slate-900 text-lg mb-1">{marker.name}</h4>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{marker.count} Active Records</p>
                             </div>
                          </Popup>
                       </Marker>
                    ))}
                 </MapContainer>
                 <div className="absolute top-10 left-10 z-10 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-2xl max-w-xs">
                    <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-2">Geospatial Audit</h4>
                    <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                       Live heatmap of application density across the national territory. Markers indicate verification hubs.
                    </p>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminDashboard;
