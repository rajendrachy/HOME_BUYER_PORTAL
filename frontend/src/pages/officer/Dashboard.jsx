import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllApplicationsWithFilters } from '../../services/api';
import FilterBar from '../../components/FilterBar';
import { exportApplicationsToCSV } from '../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, FileText, Download, Search, 
  Filter, CheckCircle2, XCircle, Clock, 
  ArrowUpRight, Users, Landmark, TrendingUp,
  LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import NotificationPanel from '../../components/NotificationPanel';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [districts, setDistricts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [filters, setFilters] = useState({
    status: 'all', district: 'all', startDate: '', endDate: '', search: '',
    sortBy: 'date_desc', limit: 10, page: 1
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getAllApplicationsWithFilters(filters);
      setApplications(data.applications);
      setPagination({ total: data.total, page: data.page, pages: data.pages, limit: filters.limit });
      if (data.filters?.districts) setDistricts(data.filters.districts);
    } catch (err) {
      setError('Operational error: Failed to fetch secure application stream.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => setFilters({ ...newFilters, page: 1 });
  const handlePageChange = (newPage) => setFilters({ ...filters, page: newPage });

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    exportApplicationsToCSV(applications, 'municipality_records');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, label: 'Pending' };
      case 'under_review': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Search, label: 'Under Review' };
      case 'approved': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle, label: 'Rejected' };
      case 'bank_selected': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Landmark, label: 'Bank Integrated' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: FileText, label: status };
    }
  };

  const stats = {
    total: pagination.total,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'bank_selected').length
  };

  const pieData = [
    { name: 'Queue', value: stats.pending, color: '#f59e0b' },
    { name: 'Secured', value: stats.approved, color: '#10b981' },
    { name: 'Other', value: Math.max(0, stats.total - stats.pending - stats.approved), color: '#6366f1' }
  ].filter(item => item.value > 0);

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Secure Records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-2xl">
                    <Users size={20} />
                 </div>
                 <div className="h-px w-10 bg-slate-200" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Municipality High-Command</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] mb-6">
                 Application <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Protocol.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-xl leading-relaxed">
                 Operational oversight for government housing subsidies. Review, verify, and authenticate citizen eligibility.
              </p>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex gap-6"
           >
              <button
                onClick={handleExportCSV}
                className="btn-premium px-8 py-5 flex items-center gap-3 bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 text-xs"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Download Ledger
              </button>
           </motion.div>
        </div>

        {/* Operational Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
           <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { l: "Total Ledger", v: stats.total, i: FileText, c: "text-slate-900", bg: "bg-white", d: "Documented Protocols" },
                { l: "Verification Queue", v: stats.pending, i: Clock, c: "text-amber-600", bg: "bg-amber-50/20", d: "Pending Authentication" },
                { l: "Authentication Rate", v: stats.approved, i: CheckCircle2, c: "text-emerald-600", bg: "bg-emerald-50/20", d: "Verified Authorizations" }
              ].map((stat, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className={`p-10 ${stat.bg} border border-white backdrop-blur-sm rounded-[3rem] shadow-sm group hover:shadow-2xl transition-all duration-500 border-b-4 border-b-transparent hover:border-b-slate-900`}
                >
                   <div className={`w-14 h-14 ${stat.c} bg-white rounded-2xl flex items-center justify-center shadow-sm mb-10 group-hover:scale-110 transition-transform`}>
                      <stat.i size={28} />
                   </div>
                   <h3 className={`text-5xl font-black ${stat.c} mb-3 tracking-tighter`}>{stat.v}</h3>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">{stat.l}</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.d}</p>
                </motion.div>
              ))}
           </div>

           <div className="lg:col-span-3">
              <NotificationPanel />
           </div>
        </div>

        {/* Records Filter Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 mb-16 shadow-xl shadow-slate-200/40 sticky top-28 z-40">
           <FilterBar
             filters={filters}
             onFilterChange={handleFilterChange}
             districts={districts}
           />
        </div>

        {/* Results Stream */}
        <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden mb-12">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Ref. Identity</th>
                       <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Subject Name</th>
                       <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Valuation Magnitude</th>
                       <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Protocol Status</th>
                       <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Directive</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                       {applications.map((app, i) => {
                          const cfg = getStatusConfig(app.status);
                          return (
                             <motion.tr 
                                key={app._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group hover:bg-slate-50/50 transition-all duration-300"
                             >
                                <td className="px-12 py-10">
                                   <div className="flex flex-col">
                                      <span className="text-xl font-black text-slate-900 tracking-tight">#{app.applicationId}</span>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Secure Entry
                                      </span>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <div className="flex flex-col">
                                      <span className="text-sm font-black text-slate-800 tracking-tight">{app.userId?.name}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{app.userId?.email}</span>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <div className="flex items-baseline gap-1">
                                      <span className="text-[10px] font-black text-slate-400">NPR</span>
                                      <span className="text-lg font-black text-slate-900 tracking-tighter">
                                         {app.property?.cost?.toLocaleString()}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <div className={`inline-flex items-center gap-3 px-6 py-3 ${cfg.bg} ${cfg.color} rounded-2xl border ${cfg.border} text-[10px] font-black uppercase tracking-[0.2em] shadow-sm`}>
                                      <cfg.icon size={14} className="animate-pulse" />
                                      {cfg.label}
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <button 
                                      onClick={() => navigate(`/officer/application/${app._id}`)}
                                      className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
                                   >
                                      Verify File <ArrowUpRight size={16} />
                                   </button>
                                </td>
                             </motion.tr>
                          );
                       })}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>

           {/* Pagination Dashboard */}
           {pagination.pages > 1 && (
              <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">
                       Protocol Page {pagination.page} of {pagination.pages}
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                       onClick={() => handlePageChange(pagination.page - 1)}
                       disabled={pagination.page === 1}
                       className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 shadow-sm disabled:opacity-30 transition-all"
                    >
                       <ChevronLeft size={24} />
                    </button>
                    <button 
                       onClick={() => handlePageChange(pagination.page + 1)}
                       disabled={pagination.page === pagination.pages}
                       className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 shadow-sm disabled:opacity-30 transition-all"
                    >
                       <ChevronRight size={24} />
                    </button>
                 </div>
              </div>
           )}
        </div>

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
