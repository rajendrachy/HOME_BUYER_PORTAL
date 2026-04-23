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

  // Advanced State
  const [banks, setBanks] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [systemConfig, setSystemConfig] = useState({
    siteName: 'HomeBuyer Portal',
    maintenanceMode: false,
    registrationOpen: true,
    subsidyCap: 1000000,
    interestRateFloor: 8.5
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (activeTab === 'overview' || activeTab === 'applications' || activeTab === 'map') fetchApplications(filters);
      if (activeTab === 'users') {
        loadUsers();
        fetchInstitutions();
      }
    }
  }, [authLoading, user, activeTab, filters, userFilters]);

  const fetchInstitutions = async () => {
    try {
      const [banksRes, muniRes] = await Promise.all([
        api.getAllBanks(),
        api.getAllMunicipalities()
      ]);
      setBanks(banksRes.data.banks || []);
      setMunicipalities(muniRes.data.municipalities || []);
    } catch (err) {
      console.error('Institutional fetch failed');
    }
  };

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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUserActionLoading(editingUser._id);
    try {
      await adminUpdateUser(editingUser._id, editingUser);
      toast.success(`Identity configuration updated for UID: ${editingUser._id.slice(-6)}`);
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error('Identity update rejected by mainframe.');
    } finally {
      setUserActionLoading(null);
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
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sovereign Administrator</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                 Command Room.
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Absolute surveillance of national housing subsidies and identity management infrastructure.
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
        <div className="flex bg-white border border-slate-100 p-1.5 rounded-[2rem] shadow-sm mb-12 max-w-5xl overflow-x-auto no-scrollbar">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'National Overview' },
             { id: 'applications', icon: FileText, label: 'Record Ledger' },
             { id: 'users', icon: Users, label: 'Identity Directory' },
             { id: 'map', icon: Globe, label: 'Geospatial Audit' },
             { id: 'settings', icon: Settings, label: 'System Control' }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
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
                      { l: "Active Identities", v: users.length || 0, i: Users, c: "text-indigo-600" }
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
                    <select 
                      className="px-8 py-4 bg-slate-50/50 rounded-xl font-black text-slate-900 text-[10px] uppercase tracking-widest border-none cursor-pointer focus:ring-0"
                      onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                    >
                       <option value="all">All Permissions</option>
                       <option value="citizen">Citizens Only</option>
                       <option value="bank_officer">Bank Officers</option>
                       <option value="municipality_officer">State Officers</option>
                       <option value="admin">Administrators</option>
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
                                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-xl shadow-slate-900/10">
                                         {u.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-900">{u.name}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-8">
                                   <div className="flex flex-col gap-1">
                                      <span className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 inline-block w-fit">
                                         {u.role.replace('_', ' ')}
                                      </span>
                                      {(u.bankName || (u.municipalityId && typeof u.municipalityId === 'object')) && (
                                         <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 ml-1">
                                            {u.bankName || u.municipalityId?.name}
                                         </span>
                                      )}
                                   </div>
                                </td>
                                <td className="px-10 py-8">
                                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                                      <span className="text-[10px] font-black uppercase tracking-widest">{u.isActive ? 'Verified' : 'Suspended'}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-right space-x-3">
                                   <button 
                                      onClick={() => {
                                         setEditingUser({ ...u });
                                         setIsEditModalOpen(true);
                                      }}
                                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                                   >
                                      Configure Identity
                                   </button>
                                   <button 
                                      onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                      className={`px-4 py-3 rounded-xl transition-all ${u.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                   >
                                      {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
           )}

           {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12">
                 <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm space-y-10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                          <Settings size={24} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mainframe Configuration</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global platform parameters and security valves</p>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform Identity</label>
                          <input 
                            type="text" 
                            value={systemConfig.siteName}
                            onChange={(e) => setSystemConfig({...systemConfig, siteName: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-slate-900" 
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subsidy Ceiling (NPR)</label>
                          <input 
                            type="number" 
                            value={systemConfig.subsidyCap}
                            onChange={(e) => setSystemConfig({...systemConfig, subsidyCap: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-slate-900" 
                          />
                       </div>
                    </div>

                    <div className="space-y-8 pt-10 border-t border-slate-50">
                       {[
                         { k: 'maintenanceMode', l: 'Protocol Maintenance Mode', d: 'Suspend all public operations for system audit.' },
                         { k: 'registrationOpen', l: 'Public Enrollment', d: 'Allow new citizens to register via the identity gateway.' }
                       ].map((opt) => (
                          <div key={opt.k} className="flex items-center justify-between group">
                             <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">{opt.l}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{opt.d}</p>
                             </div>
                             <button 
                                onClick={() => setSystemConfig({...systemConfig, [opt.k]: !systemConfig[opt.k]})}
                                className={`w-14 h-8 rounded-full transition-all relative ${systemConfig[opt.k] ? 'bg-blue-600' : 'bg-slate-200'}`}
                             >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${systemConfig[opt.k] ? 'left-7' : 'left-1'}`} />
                             </button>
                          </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => toast.success('Mainframe configuration synchronized.')}
                      className="w-full py-5 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all"
                    >
                       Synchronize Config
                    </button>
                 </div>

                 <div className="p-12 bg-rose-50 border border-rose-100 rounded-[3.5rem] flex items-center justify-between">
                    <div>
                       <h4 className="text-rose-900 font-black text-xl mb-2 tracking-tight">Danger Zone</h4>
                       <p className="text-rose-600 text-xs font-bold uppercase tracking-widest">Permanent database synchronization effects</p>
                    </div>
                    <button 
                      onClick={() => toast.error('Nuclear authorization required.')}
                      className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-600/20"
                    >
                       Purge Audit Logs
                    </button>
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

        {/* Identity Configuration Modal */}
        <AnimatePresence>
           {isEditModalOpen && editingUser && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.9, opacity: 0 }}
                   className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden"
                 >
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10">
                             <Users size={24} />
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Configure Identity</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity: {editingUser._id.slice(-8)}</p>
                          </div>
                       </div>
                       <button onClick={() => setIsEditModalOpen(false)} className="p-4 hover:bg-white rounded-2xl transition-all">
                          <UserX size={24} className="text-slate-300 hover:text-rose-500" />
                       </button>
                    </div>

                    <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Name</label>
                             <input 
                               type="text" 
                               value={editingUser.name}
                               onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Email</label>
                             <input 
                               type="email" 
                               value={editingUser.email}
                               onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Tier (Role)</label>
                             <select 
                               value={editingUser.role}
                               onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-slate-900 uppercase tracking-widest text-xs appearance-none"
                             >
                                <option value="citizen">Citizen</option>
                                <option value="bank_officer">Bank Officer</option>
                                <option value="municipality_officer">Municipality Officer</option>
                                <option value="admin">Super Admin</option>
                             </select>
                          </div>
                          
                          {/* Conditional Assignment Selectors */}
                          {editingUser.role === 'bank_officer' && (
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Assignment</label>
                                <select 
                                  value={editingUser.bankName}
                                  onChange={(e) => {
                                    const selectedBank = banks.find(b => b.name === e.target.value);
                                    setEditingUser({...editingUser, bankName: e.target.value, bankId: selectedBank?._id});
                                  }}
                                  className="w-full px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-blue-600 uppercase tracking-widest text-xs appearance-none"
                                >
                                   <option value="">No Assignment</option>
                                   {banks.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                </select>
                             </div>
                          )}

                          {editingUser.role === 'municipality_officer' && (
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Municipality Jurisdiction</label>
                                <select 
                                  value={typeof editingUser.municipalityId === 'object' ? editingUser.municipalityId?._id : editingUser.municipalityId}
                                  onChange={(e) => setEditingUser({...editingUser, municipalityId: e.target.value})}
                                  className="w-full px-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all font-black text-emerald-600 uppercase tracking-widest text-xs appearance-none"
                                >
                                   <option value="">No Jurisdiction</option>
                                   {municipalities.map(m => <option key={m._id} value={m._id}>{m.name} ({m.district})</option>)}
                                </select>
                             </div>
                          )}
                       </div>

                       <div className="flex gap-4 pt-6">
                          <button 
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-slate-100 transition-all"
                          >
                             Abort Configuration
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all"
                          >
                             Apply Protocol
                          </button>
                       </div>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminDashboard;


      </div>
    </div>
  );
};

export default AdminDashboard;
