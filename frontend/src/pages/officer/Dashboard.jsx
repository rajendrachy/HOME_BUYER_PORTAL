import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllApplicationsWithFilters } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Database, Activity, Users, 
  FileText, Globe, Settings, TrendingUp, 
  Search, Filter, ArrowRight, LayoutDashboard,
  CheckCircle2, Clock, XCircle, Info, Landmark
} from 'lucide-react';
import NotificationPanel from '../../components/NotificationPanel';
import WorkflowGuide from '../../components/WorkflowGuide';

const OfficerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    status: 'all', 
    search: '', 
    sortBy: 'newest', 
    page: 1, 
    limit: 100 
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplications();
    }
  }, [authLoading, user, filters]);

  const fetchApplications = async () => {
    try {
      const response = await getAllApplicationsWithFilters(filters);
      setApplications(response?.data?.applications || []);
    } catch (err) {
      console.error('Registry access error', err);
      toast.error('Registry Access Error: Synchronization failed.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const apps = applications || [];
    const s = { pending: 0, under_review: 0, approved: 0, bank_selected: 0, completed: 0, total: apps.length };
    apps.forEach(app => {
      if (s[app.status] !== undefined) s[app.status]++;
    });
    return s;
  }, [applications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing High-Trust Registry</p>
        </div>
      </div>
    );
  }

  // Determine current active status for the guide
  const guideStatus = stats.bank_selected > 0 ? 'bank_selected' : 
                     stats.under_review > 0 ? 'under_review' : 
                     stats.pending > 0 ? 'pending' : (stats.approved > 0 ? 'approved' : 'pending');

  // Safely get the most urgent application
  const sortedApps = [...applications].sort((a, b) => {
    return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
  });
  const mostUrgentApp = sortedApps.length > 0 ? sortedApps[0] : null;

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Municipality Authority</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                 Dossier Queue.
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Authorized verification and finalization for residential grant applications.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Sync: Active</span>
              </div>
           </motion.div>
        </div>

        {/* Protocol Guide */}
        <WorkflowGuide 
          role="municipality_officer" 
          status={guideStatus} 
          apps={applications}
          lastUpdate={mostUrgentApp?.updatedAt} 
          count={stats[guideStatus] || 0}
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
           {[
             { l: "New Requests", v: stats.pending, i: Clock, c: "text-amber-600", bg: "bg-amber-50/50" },
             { l: "Under Review", v: stats.under_review, i: Search, c: "text-blue-600", bg: "bg-blue-50/50" },
             { l: "Approved Banks", v: stats.approved, i: Landmark, c: "text-indigo-600", bg: "bg-indigo-50/50" },
             { l: "Pending Finalize", v: stats.bank_selected, i: CheckCircle2, c: "text-emerald-600", bg: "bg-emerald-50/50" },
             { l: "Completed", v: stats.completed, i: ShieldCheck, c: "text-slate-900", bg: "bg-slate-900 text-white" }
           ].map((m, i) => (
              <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`${m.bg} p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all`}
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl bg-white shadow-sm ${m.c}`}>
                       <m.i size={20} />
                    </div>
                 </div>
                 <h3 className="text-3xl font-black mb-1">{m.v}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{m.l}</p>
              </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Queue */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex bg-white border border-slate-100 p-2 rounded-[2rem] shadow-sm mb-8 overflow-x-auto no-scrollbar">
                {['all', 'pending', 'under_review', 'approved', 'bank_selected', 'completed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, status: s })}
                    className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                      filters.status === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
             </div>

             <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Ref. Identity</th>
                         <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Subject Name</th>
                         <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Submitted</th>
                         <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Protocol Status</th>
                         <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Directive</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {applications && applications.length > 0 ? (
                        applications.map((app) => (
                          <tr key={app._id} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="px-12 py-10 font-black text-slate-900 tracking-tight">#{app.applicationId}</td>
                             <td className="px-12 py-10">
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">{app.personalInfo?.fullName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.property?.district}</p>
                             </td>
                             <td className="px-12 py-10">
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-slate-900 tracking-tight">
                                      {new Date(app.createdAt).toLocaleDateString()}
                                   </span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                      {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>
                             </td>
                             <td className="px-12 py-10">
                                <span className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${
                                  app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  app.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  app.status === 'under_review' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  app.status === 'bank_selected' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  app.status === 'completed' ? 'bg-slate-900 text-white border-slate-900' :
                                  'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                   {(app.status || 'pending').replace('_', ' ')}
                                </span>
                             </td>
                             <td className="px-12 py-10 text-right">
                                <button 
                                   onClick={() => navigate(`/officer/review/${app._id}`)}
                                   className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all group/btn ml-auto"
                                >
                                   {app.status === 'bank_selected' ? 'Finalize Dossier' : 'Audit Record'} 
                                   <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                             </td>
                          </tr>
                        ))
                      ) : (
                         <tr>
                            <td colSpan="5" className="px-12 py-32 text-center">
                               <p className="text-slate-300 font-black uppercase tracking-widest">No matching dossiers in current queue.</p>
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
             <div className="h-[600px]">
                <NotificationPanel />
             </div>
             
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">Operational Directive</h4>
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Info size={18} className="text-blue-400" />
                         </div>
                         <p className="text-xs font-bold text-slate-400 leading-relaxed">
                            Prioritize dossiers in <span className="text-white">BANK_SELECTED</span> status to ensure timely subsidy disbursement.
                         </p>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mb-16" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
