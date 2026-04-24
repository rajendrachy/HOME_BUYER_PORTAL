import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, TrendingUp, CheckCircle2, XCircle, 
  Clock, Search, Filter, ArrowRight, User, 
  Landmark, Wallet, Phone, Mail, Activity,
  ChevronLeft, PieChart, BarChart3, Target
} from 'lucide-react';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMyOffers();
  }, []);

  const loadMyOffers = async () => {
    try {
      const { data } = await api.get('/applications/my-offers');
      setOffers(data.offers || []);
    } catch (err) {
      setError('Operational Error: Failed to sync portfolio ledger.');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = offers.length;
    const accepted = offers.filter(o => o.offerDetails.status === 'accepted').length;
    const rejected = offers.filter(o => o.offerDetails.status === 'rejected').length;
    const pending = offers.filter(o => o.offerDetails.status === 'offered').length;
    const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const totalVolume = offers.reduce((acc, o) => acc + (o.offerDetails.loanAmount || 0), 0);
    
    return { total, accepted, rejected, pending, conversionRate, totalVolume };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = 
        offer.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.applicantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || offer.offerDetails.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, statusFilter]);

  const getBankName = () => {
    return user?.bankName || user?.name || 'Institutional Auditor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Auditing Portfolio Ledger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button 
                 onClick={() => navigate('/bank/dashboard')} 
                 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Back to Command Center
              </button>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Briefcase size={20} />
                 </div>
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Portfolio Audit.
                 </h1>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Analyzing mortgage performance and offer conversions for {getBankName()}.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }}
             className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-10 shadow-2xl shadow-slate-900/20 border border-slate-800"
           >
              <div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Portfolio Volume</p>
                 <h3 className="text-2xl font-black tracking-tight">NPR {(stats.totalVolume / 10000000).toFixed(1)} Cr</h3>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-right">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Conversion</p>
                 <h3 className="text-2xl font-black tracking-tight">{stats.conversionRate}%</h3>
              </div>
           </motion.div>
        </div>

        {/* Performance Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
           {[
             { l: "Offers Sent", v: stats.total, i: BarChart3, c: "text-blue-600", bg: "bg-blue-50/50" },
             { l: "Acquisitions", v: stats.accepted, i: Target, c: "text-emerald-600", bg: "bg-emerald-50/50" },
             { l: "Pending Approval", v: stats.pending, i: Clock, c: "text-amber-600", bg: "bg-amber-50/50" },
             { l: "Competitor Loss", v: stats.rejected, i: Activity, c: "text-rose-600", bg: "bg-rose-50/50" }
           ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group`}
              >
                 <div className={`w-12 h-12 ${stat.bg} ${stat.c} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <stat.i size={24} />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.v}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.l}</p>
              </motion.div>
           ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 mb-12 flex flex-col md:flex-row items-center gap-6 shadow-sm">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                 type="text"
                 placeholder="Search by Applicant or Protocol ID..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
              />
           </div>
           <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
              {['all', 'accepted', 'offered', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f === 'offered' ? 'Pending' : f}
                </button>
              ))}
           </div>
        </div>

        {/* Results Stream */}
        <div className="grid grid-cols-1 gap-8">
           <AnimatePresence mode="popLayout">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer, i) => (
                  <motion.div
                    key={offer.applicationId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-6">
                             <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                #{offer.applicationId}
                             </div>
                             <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                               offer.offerDetails.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               offer.offerDetails.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                               'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                                {offer.offerDetails.status === 'offered' ? 'Waiting for Acceptance' : offer.offerDetails.status}
                             </div>
                          </div>

                          <div className="flex items-center gap-8 mb-8">
                             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                <User size={32} />
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{offer.applicantName}</h3>
                                {offer.offerDetails.status === 'accepted' ? (
                                   <div className="flex items-center gap-6">
                                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                         <Phone size={12} className="text-blue-500" /> {offer.applicantPhone}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                         <Mail size={12} className="text-blue-500" /> {offer.applicantEmail}
                                      </div>
                                   </div>
                                ) : (
                                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact details redacted until acceptance</p>
                                )}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Mortgage Amount</p>
                                <p className="text-sm font-black text-slate-900">NPR {offer.offerDetails.loanAmount?.toLocaleString()}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Interest Rate</p>
                                <p className="text-sm font-black text-blue-600">{offer.offerDetails.interestRate}% P.A.</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Monthly EMI</p>
                                <p className="text-sm font-black text-emerald-600">NPR {offer.offerDetails.emi?.toLocaleString()}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Audit Entry</p>
                                <p className="text-sm font-black text-slate-900">{new Date(offer.offerDetails.offeredAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>

                       <div className="lg:w-72 flex flex-col justify-between items-end gap-8">
                          {offer.offerDetails.status === 'accepted' && (
                             <div className="w-full p-6 bg-emerald-600 rounded-[2rem] text-white shadow-xl shadow-emerald-600/20 border-2 border-emerald-400/50">
                                <div className="flex items-center gap-3 mb-2">
                                   <CheckCircle2 size={18} />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Acquisition Confirmed</p>
                                </div>
                                <p className="text-xs font-medium leading-relaxed opacity-90">Protocol successfully finalized. Please initiate onboarding procedures immediately.</p>
                             </div>
                          )}
                          
                          <Link
                             to={`/bank/application/${offer._id}`}
                             className="w-full py-5 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 group/btn"
                          >
                             Audit Full Dossier 
                             <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                          </Link>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-[4rem]"
                >
                   <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                      <Briefcase size={40} className="text-slate-200" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-2">No Records Found</h3>
                   <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto">No offer protocols match your current search parameters or filter criteria.</p>
                   <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">
                      Clear All Filters
                   </button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyOffers;
