import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyApplications } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, TrendingUp, Clock, 
  CheckCircle2, XCircle, Wallet, 
  ShieldCheck, ArrowRight, Activity, 
  MapPin, Info, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import NotificationPanel from '../../components/NotificationPanel';
import WorkflowGuide from '../../components/WorkflowGuide';
import AdvancedSearch from '../../components/AdvancedSearch';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ 
    status: 'all', 
    district: 'all',
    search: '', 
    sortBy: 'newest', 
    page: 1, 
    limit: 100 
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    try {
      const { data } = await getMyApplications(filters);
      setApplications(data.applications || []);
      if (data.filters?.districts) {
        setDistricts(data.filters.districts);
      }
    } catch (err) {
      console.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(a => a.status === 'approved' || a.status === 'bank_selected' || a.status === 'completed').length;
    const pending = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
    const totalSubsidy = applications.reduce((acc, a) => acc + (a.subsidyApproved || 0), 0);
    
    return { total, approved, pending, totalSubsidy };
  }, [applications]);

  const chartData = [
    { name: 'Active', value: stats.pending, color: '#3b82f6' },
    { name: 'Secured', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing National Registry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
           >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Citizen Command</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                 Dashboard.
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Monitor your residential subsidy applications and national housing grants.
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

        {applications.length > 0 && (
           <WorkflowGuide 
              role="citizen" 
              status={applications[0].status} 
              apps={applications}
              lastUpdate={applications[0].updatedAt}
              count={applications.length}
           />
        )}

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
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                      <stat.i className={stat.c} size={24} />
                   </div>
                   <h3 className={`text-3xl font-black ${stat.c} mb-1 tracking-tighter`}>{stat.v}</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{stat.l}</p>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                      <Info size={10} /> {stat.d}
                   </div>
                </motion.div>
              ))}
           </div>

           {/* Quick Analytics Card */}
           <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between group shadow-2xl shadow-slate-900/20">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Protocol Distribution</p>
                 <h4 className="text-xl font-black tracking-tight mb-8">System Analytics</h4>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={chartData} 
                            innerRadius={50} 
                            outerRadius={70} 
                            paddingAngle={8} 
                            dataKey="value"
                          >
                             {chartData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
                             itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="relative z-10 pt-8 border-t border-slate-800 flex justify-between items-end">
                 <div>
                    <p className="text-2xl font-black text-blue-400">{(stats.approved/stats.total * 100 || 0).toFixed(0)}%</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Success Rate</p>
                 </div>
                 <Activity className="text-slate-800" size={48} />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
           </div>
        </div>

        {/* Advanced Search Interface */}
        <AdvancedSearch 
          filters={filters} 
          onFilterChange={setFilters} 
          districts={districts}
        />

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Application Stream */}
          <div className="lg:col-span-8 space-y-12">
             <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Active Dossiers</h2>
                <span className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Stream</span>
             </div>

             <div className="grid grid-cols-1 gap-8">
               <AnimatePresence>
                 {applications.length > 0 ? (
                   applications.map((app, i) => (
                     <motion.div
                       key={app._id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden"
                     >
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                         <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                             <FileText size={32} />
                           </div>
                           <div>
                             <div className="flex items-center gap-3 mb-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Protocol #{app.applicationId}</p>
                               <span className="w-1 h-1 bg-slate-200 rounded-full" />
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(app.createdAt).toLocaleDateString()}</p>
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{app.property?.type} Subsidy</h3>
                             <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                   <MapPin size={12} className="text-slate-300" />
                                   <p className="text-xs font-bold text-slate-500">{app.property?.district}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Wallet size={12} className="text-slate-300" />
                                   <p className="text-xs font-bold text-slate-900">NPR {app.subsidyRequested?.toLocaleString()}</p>
                                </div>
                             </div>
                           </div>
                         </div>
                         <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6">
                           <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${
                             app.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                             app.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                             app.status === 'under_review' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                             app.status === 'bank_selected' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                             app.status === 'completed' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' :
                             'bg-rose-50 border-rose-100 text-rose-600'
                           }`}>
                             <div className={`w-2 h-2 rounded-full animate-pulse ${
                               app.status === 'approved' ? 'bg-emerald-500' :
                               app.status === 'pending' ? 'bg-amber-500' :
                               app.status === 'completed' ? 'bg-white' :
                               'bg-blue-500'
                             }`} />
                             <p className="text-[10px] font-black uppercase tracking-widest">
                               {app.status.replace('_', ' ')}
                             </p>
                           </div>
                           <Link
                             to={`/citizen/application/${app._id}`}
                             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all group/btn"
                           >
                             Audit Dossier <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                           </Link>
                         </div>
                       </div>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors" />
                     </motion.div>
                   ))
                 ) : (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[4rem]"
                   >
                     <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                        <FileText size={40} className="text-slate-200" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-2">Registry Empty</h3>
                     <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto">No subsidy applications detected in the national mainframe for your identity.</p>
                     <Link to="/citizen/submit" className="btn-premium inline-flex items-center gap-3">
                        Initiate First Protocol <Plus size={20} />
                     </Link>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>

          {/* Sidebar Components */}
          <div className="lg:col-span-4 space-y-12">
             <div className="h-[600px]">
                <NotificationPanel />
             </div>

             <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Security Protocol</h4>
                   <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl mb-4 border border-transparent hover:border-emerald-100 transition-all">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                         <ShieldCheck size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">2FA Verified</p>
                         <p className="text-[9px] font-bold text-slate-400">High Trust Tier</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                         <MapPin size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Digital Residency</p>
                         <p className="text-[9px] font-bold text-slate-400">Identity Validated</p>
                      </div>
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-blue-100/20 transition-colors" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;