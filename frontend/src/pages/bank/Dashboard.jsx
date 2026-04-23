import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApprovedApplications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import FilterBar from '../../components/FilterBar';
import { exportApplicationsToCSV } from '../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Landmark, FileText, Download, 
  Search, Filter, CheckCircle2, XCircle, 
  Clock, ArrowUpRight, Wallet, TrendingUp,
  LandPlot, PieChart as PieChartIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import NotificationPanel from '../../components/NotificationPanel';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState({
    status: 'approved', district: 'all', startDate: '', endDate: '', search: '',
    sortBy: 'date_desc', limit: 10, page: 1
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const loadApplications = async () => {
    try {
      const { data } = await getApprovedApplications();
      setApplications(data.applications);
      const uniqueDistricts = [...new Set(data.applications.map(app => app.property?.district).filter(Boolean))];
      setDistricts(uniqueDistricts);
      setFilteredApplications(data.applications);
      setPagination({
        total: data.applications.length,
        page: 1,
        pages: Math.ceil(data.applications.length / filters.limit),
        limit: filters.limit
      });
    } catch (err) {
      setError('System Error: Failed to fetch the approved application stream.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationId?.toLowerCase().includes(searchTerm) ||
        app.userId?.name?.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.district && filters.district !== 'all') filtered = filtered.filter(app => app.property?.district === filters.district);
    
    const total = filtered.length;
    const start = (filters.page - 1) * filters.limit;
    const paginated = filtered.slice(start, start + filters.limit);
    setFilteredApplications(paginated);
    setPagination({ total, page: filters.page, pages: Math.ceil(total / filters.limit), limit: filters.limit });
  };

  const handleFilterChange = (newFilters) => setFilters({ ...newFilters, page: 1 });
  const handlePageChange = (newPage) => setFilters({ ...filters, page: newPage });
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) return;
    exportApplicationsToCSV(filteredApplications, 'bank_portfolio_leads');
  };

  const getMyOfferStatus = (application) => {
    if (!user || !application.bankOffers) return null;
    const myOffer = application.bankOffers.find(offer => 
      (user.bankId && offer.bankId && offer.bankId.toString() === user.bankId.toString()) ||
      (user.bankName && offer.bankName === user.bankName)
    );
    return myOffer ? { status: myOffer.status, citizenName: application.userId?.name || 'Citizen' } : null;
  };

  const hasSubmittedOffer = (application) => getMyOfferStatus(application) !== null;
  const getBankName = () => user?.bankName || user?.name || 'Financial Officer';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Portfolio Data</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(app => !hasSubmittedOffer(app)).length,
    accepted: applications.filter(app => getMyOfferStatus(app)?.status === 'accepted').length,
    waiting: applications.filter(app => getMyOfferStatus(app)?.status === 'offered').length
  };

  const pieData = [
    { name: 'Opportunities', value: stats.pending, color: '#6366f1' },
    { name: 'Secured', value: stats.accepted, color: '#10b981' },
    { name: 'Processing', value: stats.waiting, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                    <Landmark size={20} />
                 </div>
                 <div className="h-px w-10 bg-slate-200" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-600">{getBankName()} Hub</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] mb-6">
                 Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Leads.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-xl leading-relaxed">
                 High-magnitude opportunities for mortgage expansion. Analyze approved subsidies and authenticate credit directives.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-6">
              <Link to="/bank/offers" className="btn-premium px-8 py-5 flex items-center gap-4 bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-600 hover:text-indigo-600 shadow-sm text-xs">
                <FileText size={20} />
                Audit Submissions
              </Link>
              <button onClick={handleExportCSV} className="btn-premium px-8 py-5 flex items-center gap-4 bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 text-xs">
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Export Ledger
              </button>
           </motion.div>
        </div>

        {/* Financial Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
           <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { l: "Market Intelligence", v: stats.total, i: LandPlot, c: "text-slate-900", bg: "bg-white", d: "Qualified leads detected" },
                { l: "Open Opportunities", v: stats.pending, i: Wallet, c: "text-indigo-600", bg: "bg-indigo-50/20", d: "Awaiting mortgage offers" },
                { l: "Conversion Index", v: stats.accepted, i: TrendingUp, c: "text-emerald-600", bg: "bg-emerald-50/20", d: "Secured financial contracts" }
              ].map((stat, i) => (
                <motion.div 
                   key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                   className={`p-10 ${stat.bg} border border-white backdrop-blur-sm rounded-[3rem] shadow-sm group hover:shadow-2xl transition-all duration-500 border-b-4 border-b-transparent hover:border-b-indigo-600`}
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

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 mb-16 shadow-xl shadow-slate-200/40 sticky top-28 z-40">
           <FilterBar filters={filters} onFilterChange={handleFilterChange} districts={districts} />
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           <AnimatePresence mode="popLayout">
              {filteredApplications.map((app, i) => {
                 const offerInfo = getMyOfferStatus(app);
                 return (
                   <motion.div
                     key={app._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                     className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col"
                   >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-indigo-50 transition-colors duration-700" />
                      
                      <div className="flex justify-between items-start mb-12 relative z-10">
                         <div className="w-14 h-14 bg-white text-slate-300 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
                            <Building2 size={28} />
                         </div>
                         <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                            !offerInfo ? 'bg-slate-50 text-slate-400 border-slate-100' :
                            offerInfo.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            offerInfo.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                         }`}>
                            {offerInfo ? offerInfo.status : 'Prospect'}
                         </div>
                      </div>

                      <div className="mb-10 relative z-10">
                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">#{app.applicationId}</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{app.userId?.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-12 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative z-10 flex-grow">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Asset Valuation</p>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[10px] font-black text-slate-400">NPR</span>
                               <span className="text-xl font-black text-slate-900 tracking-tight">{app.property?.cost?.toLocaleString()}</span>
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Gov. Grant</p>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[10px] font-black text-slate-400">NPR</span>
                               <span className="text-xl font-black text-emerald-600 tracking-tight">{app.subsidyApproved?.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-4 relative z-10">
                         <button onClick={() => navigate(`/bank/application/${app._id}`)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all shadow-sm">
                            Audit Ledger
                         </button>
                         {!offerInfo && (
                            <button onClick={() => navigate(`/bank/application/${app._id}/offer`)} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                               Initiate Offer <ArrowUpRight size={18} />
                            </button>
                         )}
                      </div>
                   </motion.div>
                 );
              })}
           </AnimatePresence>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
           <div className="mt-16 flex justify-center items-center gap-6">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 shadow-sm disabled:opacity-30 transition-all">
                 <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Node {pagination.page} / {pagination.pages}</span>
              </div>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 shadow-sm disabled:opacity-30 transition-all">
                 <ChevronRight size={24} />
              </button>
           </div>
        )}

        {error && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-5 z-50 border border-slate-800">
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
