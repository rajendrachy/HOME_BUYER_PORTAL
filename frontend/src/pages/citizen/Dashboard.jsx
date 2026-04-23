import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, Filter, ArrowRight, 
  Clock, CheckCircle2, XCircle, Banknote, 
  ArrowUpRight, LayoutDashboard, FileText, 
  TrendingUp, Wallet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, label: 'Pending' };
      case 'under_review': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Search, label: 'Under Review' };
      case 'approved': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle, label: 'Rejected' };
      case 'bank_selected': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Building2, label: 'Bank Selected' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: FileText, label: status };
    }
  };

  const getFilteredApplications = () => {
    let filtered = [...applications];
    if (searchTerm) filtered = filtered.filter(app => app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') filtered = filtered.filter(app => app.status === statusFilter);
    
    switch (sortBy) {
      case 'newest': filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)); break;
      case 'highest_cost': filtered.sort((a, b) => (b.property?.cost || 0) - (a.property?.cost || 0)); break;
      case 'lowest_cost': filtered.sort((a, b) => (a.property?.cost || 0) - (b.property?.cost || 0)); break;
      default: break;
    }
    return filtered;
  };

  const filteredApplications = getFilteredApplications();
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'bank_selected').length,
    totalSubsidy: applications.reduce((sum, a) => sum + (a.subsidyApproved || 0), 0)
  };

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Other', value: stats.total - stats.pending - stats.approved, color: '#6366f1' }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans selection:bg-blue-600 selection:text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[400px] left-[-5%] w-[400px] h-[400px] bg-indigo-100/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <LayoutDashboard size={20} />
                 </div>
                 <div className="h-px w-8 bg-slate-200" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600">Command Center</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] mb-6">
                 Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Applications.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-xl leading-relaxed">
                 Seamlessly manage your home ownership journey and government subsidy lifecycle in one centralized hub.
              </p>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
              <Link
                to="/citizen/submit"
                className="btn-premium px-10 py-6 flex items-center gap-4 group text-sm"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                Initiate New Application
              </Link>
           </motion.div>
        </div>

        {/* Top Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
           {/* Primary Stats */}
           <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { l: "Total Applications", v: stats.total, i: FileText, c: "text-slate-900", bg: "bg-white", d: "Submitted Records" },
                { l: "Approved Grants", v: stats.approved, i: TrendingUp, c: "text-emerald-600", bg: "bg-emerald-50/20", d: "Verified Subsidies" },
                { l: "Total Grant Value", v: `NPR ${stats.totalSubsidy.toLocaleString()}`, i: Wallet, c: "text-blue-600", bg: "bg-blue-50/20", d: "Capital Allocation" }
              ].map((stat, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className={`p-10 ${stat.bg} border border-white/80 backdrop-blur-sm rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 group border-b-4 border-b-transparent hover:border-b-blue-600`}
                >
                   <div className={`w-14 h-14 ${stat.c} bg-white rounded-2xl flex items-center justify-center shadow-sm mb-10 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500`}>
                      <stat.i size={28} />
                   </div>
                   <h3 className={`text-4xl lg:text-5xl font-black ${stat.c} mb-3 tracking-tighter leading-none`}>{stat.v}</h3>
                   <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">{stat.l}</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.d}</p>
                </motion.div>
              ))}
           </div>

           {/* Visualization Mini-Card */}
           <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden flex items-center justify-between border border-slate-800 shadow-2xl">
              <div className="relative z-10">
                 <h4 className="text-white font-black text-3xl mb-3 tracking-tight">Analytics</h4>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Status Distribution</p>
                 <div className="space-y-4">
                    {pieData.map((d, i) => (
                       <div key={i} className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }} />
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{d.name}</span>
                          <span className="text-white text-xs font-black ml-auto">{d.value}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="w-44 h-44 relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={10} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                       <p className="text-white text-xl font-black leading-none">{stats.total}</p>
                       <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mt-1">Total</p>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] -mr-40 -mt-40" />
           </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-5 mb-16 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-5 items-center sticky top-28 z-40">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search Identity Token (Application ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 font-bold text-slate-900 border border-slate-100 focus:border-blue-200 transition-all placeholder:text-slate-300 placeholder:font-medium"
              />
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative group">
                 <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" size={16} />
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="pl-12 pr-10 py-5 bg-slate-50/50 rounded-2xl font-black text-slate-900 text-[11px] uppercase tracking-widest border border-slate-100 focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none cursor-pointer min-w-[180px]"
                 >
                   <option value="all">Global Filter</option>
                   <option value="pending">Pending Review</option>
                   <option value="approved">Approved Applications</option>
                   <option value="bank_selected">Financial Integration</option>
                 </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-8 py-5 bg-slate-50/50 rounded-2xl font-black text-slate-900 text-[11px] uppercase tracking-widest border border-slate-100 focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="newest">Recent Chronology</option>
                <option value="highest_cost">Capital Magnitude</option>
              </select>
           </div>
        </div>

        {/* Applications Grid */}
        <AnimatePresence mode="popLayout">
           {filteredApplications.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[4rem] py-40 border-2 border-dashed border-slate-100 text-center flex flex-col items-center"
             >
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 text-slate-200 shadow-inner group overflow-hidden relative">
                   <div className="absolute inset-0 bg-blue-600/5 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full" />
                   <FileText size={56} className="relative z-10" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Zero Protocols Found</h3>
                <p className="text-xl text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                   No applications matching your current filter criteria were detected in our synchronization layer.
                </p>
                <Link to="/citizen/submit" className="mt-12 text-blue-600 font-black uppercase tracking-[0.3em] text-xs hover:text-blue-700 transition-colors flex items-center gap-3">
                   Create New Application <ArrowRight size={16} />
                </Link>
             </motion.div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredApplications.map((app, i) => {
                   const cfg = getStatusConfig(app.status);
                   return (
                     <motion.div
                       key={app._id}
                       layout
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-blue-50 transition-colors duration-700" />
                        
                        <div className="flex justify-between items-start mb-12 relative z-10">
                           <div className={`px-6 py-3 ${cfg.bg} ${cfg.color} rounded-2xl border ${cfg.border} text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3 shadow-sm`}>
                              <cfg.icon size={16} className="animate-pulse" />
                              {cfg.label}
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">
                              {new Date(app.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </div>

                        <div className="mb-10 relative z-10">
                           <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">#{app.applicationId}</h3>
                           <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-blue-500" />
                              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Premium Residential Asset</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative z-10">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Asset Valuation</p>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-[10px] font-black text-slate-400">NPR</span>
                                 <p className="text-xl font-black text-slate-900 tracking-tight">{app.property?.cost?.toLocaleString()}</p>
                              </div>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Allocated Grant</p>
                              <div className="flex items-baseline gap-1">
                                 {app.subsidyApproved > 0 && <span className="text-[10px] font-black text-slate-400">NPR</span>}
                                 <p className={`text-xl font-black tracking-tight ${app.subsidyApproved > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {app.subsidyApproved > 0 ? app.subsidyApproved.toLocaleString() : '--'}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <button 
                           onClick={() => navigate(`/citizen/application/${app._id}`)}
                           className="w-full py-6 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-slate-200 group-hover:shadow-blue-600/20 relative z-10"
                        >
                           Examine Parameters
                           <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                     </motion.div>
                   );
                })}
             </div>
           )}
        </AnimatePresence>

        {error && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-5 z-50 border border-slate-800"
           >
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                 <XCircle size={18} />
              </div>
              {error}
           </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;