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
  TrendingUp, Globe, Database, Settings, X, Building2
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
  const [editingApp, setEditingApp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
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
      if (activeTab === 'users' || activeTab === 'settings') {
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
      const { data } = await api.adminGetAllUsers(userFilters);
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
      await api.adminUpdateUser(editingUser._id, editingUser);
      toast.success(`Identity configuration updated for UID: ${editingUser._id.slice(-6)}`);
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error('Identity update rejected by mainframe.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.adminUpdateApplication(editingApp._id, editingApp);
      toast.success(`Dossier #${editingApp.applicationId} updated via Administrative Override.`);
      setIsAppModalOpen(false);
      fetchApplications(filters);
    } catch (err) {
      toast.error('Dossier override rejected by core.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setUserActionLoading(userId);
    try {
      await api.adminUpdateUser(userId, { isActive: !currentStatus });
      toast.success(`Access level adjusted for UID: ${userId.slice(-6)}`);
      loadUsers();
    } catch (err) {
      toast.error('Identity update rejected by system.');
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Irreversible Operation. Proceed to purge identity and associated data?')) return;
    setUserActionLoading(userId);
    try {
      await api.adminDeleteUser(userId);
      toast.success('Identity profile successfully purged from mainframe.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identity purge rejected by system constraint.');
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
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Absolute Sovereign</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                 Command Center.
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Absolute surveillance and intervention capabilities for national housing subsidy infrastructure.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Sync Active</span>
              </div>
           </motion.div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex bg-white border border-slate-100 p-1.5 rounded-[2rem] shadow-sm mb-12 max-w-6xl overflow-x-auto no-scrollbar">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'Global Intelligence' },
             { id: 'applications', icon: FileText, label: 'Dossier Ledger' },
             { id: 'users', icon: Users, label: 'Identity Directory' },
             { id: 'map', icon: Globe, label: 'Geospatial Audit' },
             { id: 'settings', icon: Settings, label: 'Operational Control' }
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
                      { l: "Global Dossiers", v: applications.length, i: Database, c: "text-slate-900" },
                      { l: "Verification Pipeline", v: stats.pending, i: Activity, c: "text-amber-600" },
                      { l: "Capital Disbursed", v: stats.approved, i: TrendingUp, c: "text-emerald-600" },
                      { l: "Secure Identities", v: users.length || 0, i: Users, c: "text-indigo-600" }
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
                       <h3 className="text-xl font-black text-slate-900 mb-10 uppercase tracking-widest">Global Throughput</h3>
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

           {activeTab === 'applications' && (
              <motion.div key="applications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                       <input
                         type="text"
                         placeholder="Scan record ledger..."
                         value={filters.search}
                         onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                         className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-medium text-slate-900 border border-transparent focus:border-slate-100 transition-all"
                       />
                    </div>
                 </div>

                 <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Record ID</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Applicant</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Intervention</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {applications.map((app) => (
                             <tr key={app._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-8 font-black text-slate-900">#{app.applicationId}</td>
                                <td className="px-10 py-8 font-bold text-slate-500">{app.personalInfo?.fullName}</td>
                                <td className="px-10 py-8">
                                   <span className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                      {app.status.replace('_', ' ')}
                                   </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                   <button 
                                      onClick={() => {
                                         setEditingApp({ ...app });
                                         setIsAppModalOpen(true);
                                      }}
                                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all"
                                   >
                                      Override Dossier
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
           )}

           {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 {/* User table same as before but with "Absolute Identity Suite" header */}
                 <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Profile</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Access Tier</th>
                             <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Operational Control</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {users.map((u) => (
                             <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-8 flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{u.name.charAt(0)}</div>
                                   <div><p className="text-sm font-black text-slate-900">{u.name}</p><p className="text-[10px] font-bold text-slate-400">{u.email}</p></div>
                                </td>
                                <td className="px-10 py-8"><span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black uppercase">{u.role}</span></td>
                                <td className="px-10 py-8 text-right flex justify-end gap-3">
                                   <button 
                                      onClick={() => { setEditingUser({ ...u }); setIsEditModalOpen(true); }}
                                      className="px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all"
                                   >
                                      Configure
                                   </button>
                                   <button 
                                      onClick={() => handleDeleteUser(u._id)}
                                      disabled={userActionLoading === u._id}
                                      className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                      title="Purge Identity"
                                   >
                                      {userActionLoading === u._id ? <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" /> : <Trash2 size={16} />}
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
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto space-y-12">
                 {/* System Config - Same as before but with "Absolute Mainframe" header */}
                 <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm space-y-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mainframe Synchronization</h3>
                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Identity</label>
                          <input type="text" value={systemConfig.siteName} onChange={(e) => setSystemConfig({...systemConfig, siteName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Subsidy (NPR)</label>
                          <input type="number" value={systemConfig.subsidyCap} onChange={(e) => setSystemConfig({...systemConfig, subsidyCap: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                       </div>
                    </div>
                    <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Commit Global Changes</button>
                 </div>

                 {/* NEW: Institutional Management */}
                 <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm h-fit">
                       <h4 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                          <Building2 size={20} className="text-blue-600" /> Fiscal Hubs (Banks)
                       </h4>
                       <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {banks.map(bank => (
                             <div key={bank._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl group border border-transparent hover:border-blue-100">
                                <div><p className="text-sm font-black text-slate-900">{bank.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bank.branch} Branch</p></div>
                                <button className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                             </div>
                          ))}
                       </div>
                       <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-blue-600 hover:border-blue-100 transition-all">+ Add Fiscal Node</button>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm h-fit">
                       <h4 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                          <Globe size={20} className="text-emerald-600" /> Jurisdictions (Municipalities)
                       </h4>
                       <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {municipalities.map(muni => (
                             <div key={muni._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl group border border-transparent hover:border-emerald-100">
                                <div><p className="text-sm font-black text-slate-900">{muni.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{muni.district} District</p></div>
                                <button className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                             </div>
                          ))}
                       </div>
                       <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-emerald-600 hover:border-emerald-100 transition-all">+ Add Jurisdiction</button>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-[4rem] border border-slate-100 shadow-xl h-[700px] overflow-hidden relative">
                 <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '3rem' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {mapMarkers.map((marker, idx) => (
                       <Marker key={idx} position={marker.coords}>
                          <Popup><div className="p-4"><h4 className="font-black text-slate-900 text-lg mb-1">{marker.name}</h4><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{marker.count} Records</p></div></Popup>
                       </Marker>
                    ))}
                 </MapContainer>
              </motion.div>
           )}
        </AnimatePresence>

        {/* --- OVERRIDE MODALS --- */}

        {/* Application Override Modal */}
        <AnimatePresence>
           {isAppModalOpen && editingApp && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Dossier Override: #{editingApp.applicationId}</h3>
                       <button onClick={() => setIsAppModalOpen(false)}><X size={24} className="text-slate-300" /></button>
                    </div>
                    <form onSubmit={handleUpdateApplication} className="p-10 space-y-8 overflow-y-auto">
                       <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Status</label>
                             <select value={editingApp.status} onChange={(e) => setEditingApp({...editingApp, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest appearance-none">
                                <option value="pending">Pending Review</option>
                                <option value="under_review">Verification Phase</option>
                                <option value="approved">Subsidy Authorized</option>
                                <option value="bank_selected">Financial Integration</option>
                                <option value="completed">Operational Disbursement</option>
                                <option value="rejected">Audit Failure</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approved Subsidy</label>
                             <input type="number" value={editingApp.subsidyApproved} onChange={(e) => setEditingApp({...editingApp, subsidyApproved: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property District</label>
                             <input type="text" value={editingApp.property?.district} onChange={(e) => setEditingApp({...editingApp, property: { ...editingApp.property, district: e.target.value }})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Apply Override Protocol</button>
                       </div>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* User Modal - Same as before */}
        <AnimatePresence>
           {isEditModalOpen && editingUser && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Configure Identity</h3>
                       <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-slate-300" /></button>
                    </div>
                    <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Email</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" /></div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Tier</label><select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black uppercase tracking-widest text-xs"><option value="citizen">Citizen</option><option value="bank_officer">Bank Officer</option><option value="municipality_officer">Municipality Officer</option><option value="admin">Super Admin</option></select></div>
                       </div>
                       <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Synchronize Identity</button>
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
