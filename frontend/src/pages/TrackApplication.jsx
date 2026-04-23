import React, { useState } from 'react';
import { trackApplication } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, Clock, CheckCircle2, 
  XCircle, Building2, MapPin, Calendar, 
  Wallet, FileText, ArrowRight, Activity
} from 'lucide-react';

const TrackApplication = () => {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const { data } = await trackApplication(applicationId);
      setApplication(data.application);
    } catch (err) {
      setError(err.response?.data?.message || 'The specified Application ID could not be found.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pending Verification', icon: Clock, color: 'text-amber-500', step: 1 };
      case 'under_review': return { label: 'Under Review', icon: Activity, color: 'text-blue-500', step: 2 };
      case 'approved': return { label: 'Subsidy Approved', icon: CheckCircle2, color: 'text-emerald-500', step: 3 };
      case 'bank_selected': return { label: 'Bank Integration', icon: Building2, color: 'text-indigo-500', step: 4 };
      case 'rejected': return { label: 'Application Rejected', icon: XCircle, color: 'text-rose-500', step: 0 };
      default: return { label: status, icon: FileText, color: 'text-slate-500', step: 1 };
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Decorative Accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-[-5%] w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24">
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-full mb-10 border border-blue-50 shadow-sm"
           >
              <ShieldCheck size={18} className="animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Official Protocol Tracker</span>
           </motion.div>
           <h1 className="text-6xl lg:text-8xl font-black text-slate-900 mb-8 tracking-[-0.04em] leading-[0.9]">
              Track your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Progress.</span>
           </h1>
           <p className="text-xl lg:text-2xl text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
              Enter your unique Application Token to synchronize with our real-time verification infrastructure.
           </p>
        </div>

        {/* Search Bar */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white/80 backdrop-blur-2xl p-5 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white mb-20 flex items-center group focus-within:ring-[12px] focus-within:ring-blue-600/5 transition-all"
        >
           <form onSubmit={handleSubmit} className="flex flex-1 items-center">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mr-8 group-focus-within:bg-blue-600 group-focus-within:rotate-[5deg] transition-all duration-500 shadow-xl">
                 <Search size={32} />
              </div>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="APP-2026-XXXXX"
                className="flex-1 bg-transparent border-none focus:ring-0 text-3xl font-black text-slate-900 placeholder:text-slate-100 uppercase tracking-widest"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-6 bg-blue-600 text-white hover:bg-slate-900 rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 disabled:opacity-50 shadow-xl shadow-blue-600/20"
              >
                {loading ? 'Synchronizing...' : 'Verify Status'}
              </button>
           </form>
        </motion.div>

        {/* Results Context */}
        <AnimatePresence mode="wait">
           {error && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-10 bg-white border border-rose-100 rounded-[2.5rem] flex items-center gap-8 text-rose-600 font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-900/5"
             >
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                   <XCircle size={28} />
                </div>
                {error}
             </motion.div>
           )}

           {application && (
             <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-10"
             >
                {/* Status Timeline Card */}
                <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-white shadow-2xl shadow-blue-900/5 overflow-hidden relative">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 relative z-10">
                      <div>
                         <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 mb-4">Application Synchronization</h3>
                         <h2 className="text-5xl font-black text-slate-900 tracking-[-0.03em]">#{application.applicationId}</h2>
                      </div>
                      <div className="flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                         {React.createElement(getStatusConfig(application.status).icon, { size: 22, className: "text-blue-400" })}
                         <span className="text-xs font-black uppercase tracking-[0.25em]">
                            {getStatusConfig(application.status).label}
                         </span>
                      </div>
                   </div>

                   {/* High-Fidelity Journey Tracker */}
                   <div className="relative pt-12 pb-24 px-4">
                      {/* Background Path */}
                      <div className="absolute top-[68px] left-0 w-full h-[2px] bg-slate-100" />
                      
                      {/* Active Path */}
                      <div 
                         className="absolute top-[68px] left-0 h-[2px] bg-blue-600 transition-all duration-1000" 
                         style={{ 
                            width: application.status === 'pending' ? '0%' :
                                   application.status === 'under_review' ? '25%' :
                                   application.status === 'approved' ? '50%' :
                                   application.status === 'bank_selected' ? '75%' : '100%' 
                         }} 
                      />

                      <div className="relative flex justify-between">
                         {[
                            { id: 'pending', label: 'Submission', desc: 'Entry Logged', icon: FileText },
                            { id: 'under_review', label: 'Verification', desc: 'Officer Audit', icon: Search },
                            { id: 'approved', label: 'Approval', desc: 'Subsidy Granted', icon: ShieldCheck },
                            { id: 'bank_selected', label: 'Integration', desc: 'Bank Connected', icon: Building2 },
                            { id: 'completed', label: 'Finalized', desc: 'Grant Disbursed', icon: CheckCircle2 }
                         ].map((step, idx) => {
                            const stages = ['pending', 'under_review', 'approved', 'bank_selected', 'completed'];
                            const currentIdx = stages.indexOf(application.status);
                            const stepIdx = idx;
                            const isCompleted = stepIdx < currentIdx;
                            const isActive = stepIdx === currentIdx;
                            
                            return (
                               <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                                  <div 
                                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                                        isCompleted ? 'bg-blue-600 border-blue-100 text-white shadow-xl shadow-blue-600/20' :
                                        isActive ? 'bg-white border-blue-600 text-blue-600 shadow-2xl scale-125' :
                                        'bg-white border-slate-100 text-slate-300'
                                     }`}
                                  >
                                     <step.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                  </div>
                                  <div className="absolute top-20 text-center w-40">
                                     <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                        {step.label}
                                     </p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {step.desc}
                                     </p>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>

                   {/* Detail Grid */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10 border-t border-slate-50 pt-16">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Official Submission</p>
                         <p className="text-sm font-black text-slate-900 tracking-tight">{new Date(application.submittedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Asset Valuation</p>
                         <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black text-slate-400">NPR</span>
                            <span className="text-lg font-black text-slate-900 tracking-tighter">{application.property?.cost?.toLocaleString()}</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Fiscal Subsidy</p>
                         <div className="flex items-baseline gap-1">
                            {application.subsidyApproved > 0 && <span className="text-[10px] font-black text-slate-400">NPR</span>}
                            <span className={`text-lg font-black tracking-tighter ${application.subsidyApproved > 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                               {application.subsidyApproved > 0 ? application.subsidyApproved.toLocaleString() : 'Pending Audit'}
                            </span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Authority</p>
                         <p className="text-sm font-black text-slate-900 tracking-tight">Ministry of Housing</p>
                      </div>
                   </div>

                   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
                </div>

                {/* Additional Info / CTA */}
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="p-12 bg-slate-900 rounded-[3.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                      <div className="relative z-10">
                         <h4 className="text-white font-black text-2xl mb-4 tracking-tight">Operational Support</h4>
                         <p className="text-slate-500 text-base font-medium mb-10 leading-relaxed">If you detect a discrepancy in your protocol stream, contact our sovereign support directive.</p>
                         <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 hover:text-white transition-all group/btn">
                            Initiate Contact <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                         </button>
                      </div>
                      <Activity className="absolute bottom-[-30px] right-[-30px] text-white/5 group-hover:text-blue-600/10 transition-all duration-700" size={200} />
                   </div>
                   <div className="p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl shadow-blue-900/5 flex flex-col justify-between">
                      <div>
                         <h4 className="text-slate-900 font-black text-2xl mb-4 tracking-tight">Legal Certification</h4>
                         <p className="text-slate-500 text-sm font-medium leading-relaxed">Download the cryptographically signed verification certificate once your protocol reaches 'Approved' status.</p>
                      </div>
                      <button 
                         disabled={application.status !== 'approved' && application.status !== 'bank_selected'}
                         className="w-full py-6 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-[10px] disabled:opacity-20 disabled:cursor-not-allowed mt-10 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all duration-500"
                      >
                         Download Certificate
                      </button>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TrackApplication;
