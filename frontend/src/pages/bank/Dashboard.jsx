import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getApprovedApplications } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Landmark, TrendingUp, Users,
  FileText, ShieldCheck, ArrowRight, Activity,
  MapPin, Wallet, Clock, Search
} from 'lucide-react';
import NotificationPanel from '../../components/NotificationPanel';
import WorkflowGuide from '../../components/WorkflowGuide';

const BankDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myOffers, setMyOffers] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplications();
      fetchMyOffers();
    }
  }, [authLoading, user]);

  const fetchApplications = async () => {
    try {
      const response = await getApprovedApplications();
      const appData = response?.data?.applications || [];
      setApplications(appData);
    } catch (err) {
      console.error('Lead sync failed', err);
      toast.error('Registry Sync Failed: Access to approved leads restricted.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOffers = async () => {
    try {
      const { data } = await api.get('/applications/my-offers');
      setMyOffers(data.offers || []);
    } catch (err) {
      console.error('Portfolio sync failed', err);
    }
  };

  const stats = useMemo(() => {
    const apps = applications || [];
    const total = apps.length;
    const totalSubsidy = apps.reduce((acc, a) => acc + (a.subsidyApproved || 0), 0);
    const totalCost = apps.reduce((acc, a) => acc + (a.property?.cost || 0), 0);

    // Portfolio Metrics
    const offersSent = myOffers.length;
    const accepted = myOffers.filter(o => o.offerDetails.status === 'accepted').length;
    const conversion = offersSent > 0 ? Math.round((accepted / offersSent) * 100) : 0;

    return {
      availableLeads: total,
      avgSubsidy: total > 0 ? totalSubsidy / total : 0,
      totalCapitalReq: totalCost,
      offersSent,
      conversion
    };
  }, [applications, myOffers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing National Subsidy Leads</p>
        </div>
      </div>
    );
  }

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
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Building2 size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Fiscal Institution Portal</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              Bidding Hub.
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-lg">
              Exclusive access to verified housing subsidy leads and loan processing.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Online</span>
            </div>
          </motion.div>
        </div>

        {/* Bidding Protocol Guide */}
        <WorkflowGuide
          role="bank_officer"
          status="approved"
          apps={applications}
          lastUpdate={mostUrgentApp?.updatedAt}
          count={applications.length}
        />

        {/* Market Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { l: "Available Leads", v: stats.availableLeads, i: Users, c: "text-slate-900", bg: "bg-white" },
            { l: "Market Throughput", v: `NPR ${(stats.totalCapitalReq / 1000000).toFixed(1)}M`, i: TrendingUp, c: "text-emerald-600", bg: "bg-emerald-50/20" },
            { l: "Avg. Subsidy Cap", v: `NPR ${(stats.avgSubsidy / 1000).toFixed(0)}K`, i: Wallet, c: "text-indigo-600", bg: "bg-indigo-50/20" },
            { l: "Protocol Health", v: "High Trust", i: ShieldCheck, c: "text-blue-600", bg: "bg-blue-50/20" }
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${m.bg} p-10 border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group`}
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                <m.i className={m.c} size={24} />
              </div>
              <h3 className={`text-4xl font-black ${m.c} mb-1 tracking-tighter`}>{m.v}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.l}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Approved Leads Stream */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                Verified Leads <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px]">{applications.length} Available</span>
              </h2>
              <div className="flex gap-2">
                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Search size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence>
                {applications && applications.length > 0 ? (
                  applications.map((app, i) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-10">
                          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                            <FileText size={40} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Lead Protocol #{app.applicationId}</p>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified {new Date(app.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors mb-4">{app.personalInfo?.fullName}</h3>
                            <div className="flex flex-wrap gap-6">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-slate-300" />
                                <p className="text-sm font-bold text-slate-500">{app.property?.district}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Landmark size={14} className="text-slate-300" />
                                <p className="text-sm font-bold text-slate-900">NPR {app.property?.cost?.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/bank/application/${app._id}`)}
                          className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-4 group/btn"
                        >
                          Analyze Lead <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 group-hover:bg-indigo-50 transition-colors" />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40 bg-white border border-dashed border-slate-200 rounded-[4rem]"
                  >
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                      <Activity size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Market Latency Detect</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Currently no verified housing subsidy leads are awaiting fiscal integration. Leads appear here once authorized by national municipality officers.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="h-[600px]">
              <NotificationPanel />
            </div>

            <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-8">Performance Metric</h4>
                <div className="flex items-center gap-10">
                  <div>
                    <p className="text-5xl font-black tracking-tighter mb-1">{stats.conversion}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Conversion</p>
                  </div>
                  <div className="w-[1px] h-12 bg-indigo-500" />
                  <div>
                    <p className="text-5xl font-black tracking-tighter mb-1">{stats.offersSent}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Offers Sent</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/bank/offers')}
                  className="w-full mt-12 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                >
                  View Portfolio Audit
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDashboard;
