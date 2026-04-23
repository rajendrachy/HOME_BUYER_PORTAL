import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApplicationById } from '../../services/api';
import { getFileUrl, getDocPreviewUrl } from '../../utils/fileConfig';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, FileText, ArrowRight, User, 
  Building2, Landmark, Wallet, Eye, 
  ShieldCheck, LandPlot, TrendingUp, Info
} from 'lucide-react';

const BankApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
    } catch (err) {
      setError('Operational Error: Ledger access denied.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Risk Dossier</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6">
         <div className="text-center bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 max-w-md">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Record Not Found</h2>
            <button onClick={() => navigate('/bank/dashboard')} className="btn-premium w-full flex items-center justify-center gap-3">
               <ChevronLeft size={20} /> Return to Portfolio
            </button>
         </div>
      </div>
    );
  }

  const loanRequired = application.property?.cost - application.subsidyApproved;

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button 
                 onClick={() => navigate('/bank/dashboard')} 
                 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Back to Portfolio
              </button>
              <div className="flex items-center gap-6 mb-4">
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Risk Audit.
                 </h1>
                 <div className="px-6 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                    #{application.applicationId}
                 </div>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Pre-approved governmental record for applicant: {application.personalInfo?.fullName}.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Link 
                to={`/bank/application/${id}/offer`}
                className="btn-premium flex items-center gap-3 group bg-indigo-600 shadow-indigo-600/20"
              >
                Structure Mortgage Offer
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </motion.div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           {[
             { l: "Certified Asset Value", v: application.property?.cost, i: LandPlot, c: "text-slate-900", bg: "bg-white" },
             { l: "Government Grant", v: application.subsidyApproved, i: TrendingUp, c: "text-emerald-600", bg: "bg-emerald-50/30" },
             { l: "Mortgage Requirement", v: loanRequired, i: Wallet, c: "text-indigo-600", bg: "bg-indigo-50/30" }
           ].map((stat, i) => (
              <motion.div 
                 key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                 className={`p-10 ${stat.bg} border border-slate-100 rounded-[2.5rem] shadow-sm group hover:shadow-xl transition-all duration-500`}
              >
                 <div className={`w-12 h-12 ${stat.c} bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8`}>
                    <stat.i size={24} />
                 </div>
                 <h3 className={`text-4xl font-black ${stat.c} mb-2 tracking-tighter`}>NPR {stat.v?.toLocaleString()}</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.l}</p>
              </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
           {/* Detailed Information */}
           <div className="lg:col-span-8 space-y-12">
              <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm"
              >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <section>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 flex items-center gap-2">
                          <User size={14} /> Applicant Identity
                       </h4>
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Legal Name</p>
                             <p className="text-lg font-bold text-slate-900">{application.personalInfo?.fullName}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Access</p>
                             <p className="text-sm font-bold text-slate-900">{application.personalInfo?.phone}</p>
                             <p className="text-xs font-medium text-slate-400">{application.personalInfo?.email}</p>
                          </div>
                       </div>
                    </section>

                    <section>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-8 flex items-center gap-2">
                          <Building2 size={14} /> Revenue Stream
                       </h4>
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Tier</p>
                             <p className="text-lg font-bold text-slate-900 capitalize">{application.employment?.type}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Yield</p>
                             <p className="text-sm font-bold text-slate-900">NPR {application.employment?.monthlyIncome?.toLocaleString()}</p>
                          </div>
                       </div>
                    </section>
                 </div>
              </motion.div>

              {/* Documentation Audit */}
              <div className="space-y-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest ml-4">Risk Evidence</h3>
                 <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { l: "Identity Certification", n: "citizenshipDocument", i: ShieldCheck },
                      { l: "Revenue Proof", n: "incomeProofDocument", i: Wallet },
                      { l: "Asset Ledger", n: "propertyDocument", i: Landmark }
                    ].map((doc, i) => (
                       <motion.div 
                          key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (i * 0.1) }}
                          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
                       >
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                             <doc.i size={24} />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest leading-tight">{doc.l}</h4>
                          {application[doc.n] ? (
                             <a href={getDocPreviewUrl(application[doc.n])} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                                Audit File <Eye size={14} />
                             </a>
                          ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">File Redacted</span>
                          )}
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Sidebar: Compliance & Status */}
           <div className="lg:col-span-4 space-y-12">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                 <ShieldCheck className="text-indigo-400 mb-8" size={32} />
                 <h4 className="text-xl font-black mb-4 tracking-tight">Compliance Status</h4>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-px bg-slate-800 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Government Clearance</p>
                          <p className="text-xs font-bold text-emerald-400">PASSED</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-px bg-slate-800 relative" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Officer Signature</p>
                          <p className="text-xs font-bold text-slate-300">Verified Digitally</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mb-16" />
              </div>

              {application.officerNotes && (
                 <div className="bg-indigo-50 rounded-[3rem] p-10 border border-indigo-100">
                    <div className="flex items-center gap-4 mb-6">
                       <Info className="text-indigo-600" size={24} />
                       <h4 className="text-xs font-black uppercase tracking-widest text-indigo-900">Public Audit Note</h4>
                    </div>
                    <p className="text-sm font-medium text-indigo-800 leading-relaxed italic">
                       "{application.officerNotes}"
                    </p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default BankApplicationDetail;
