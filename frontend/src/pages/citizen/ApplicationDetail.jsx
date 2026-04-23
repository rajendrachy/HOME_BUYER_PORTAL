import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, acceptOffer } from '../../services/api';
import { generateApplicationPDF } from '../../utils/pdfGenerator';
import { getFileUrl, getDocPreviewUrl } from '../../utils/fileConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, FileText, Download, User, 
  Building2, Landmark, ShieldCheck, MapPin, 
  Wallet, Clock, CheckCircle2, XCircle, 
  Eye, ExternalLink, Calendar, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to accept this bank offer?')) return;
    setAccepting(true);
    try {
      await acceptOffer(id, offerId);
      toast.success('Offer accepted successfully!');
      loadApplication();
    } catch (err) {
      toast.error('Failed to accept offer: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setAccepting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, label: 'Pending' };
      case 'under_review': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Info, label: 'Under Review' };
      case 'approved': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle, label: 'Rejected' };
      case 'bank_selected': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Landmark, label: 'Bank Selected' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: FileText, label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Dossier</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6">
         <div className="text-center bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 max-w-md">
            <XCircle size={64} className="text-rose-100 mx-auto mb-8" />
            <h2 className="text-2xl font-black text-slate-900 mb-4">Record Not Found</h2>
            <p className="text-slate-400 font-medium mb-10">{error || 'The requested application record is not available.'}</p>
            <button onClick={() => navigate('/citizen/dashboard')} className="btn-premium w-full flex items-center justify-center gap-3">
               <ChevronLeft size={20} /> Back to Dashboard
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button 
                 onClick={() => navigate('/citizen/dashboard')} 
                 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Back to Application Stream
              </button>
              <div className="flex items-center gap-6 mb-4">
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Dossier.
                 </h1>
                 <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10">
                    #{application.applicationId}
                 </div>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Official government record for residential subsidy verification.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <button 
                onClick={() => generateApplicationPDF(application)}
                className="btn-premium flex items-center gap-3 group bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-600 hover:text-blue-600 shadow-sm"
              >
                <Download size={20} />
                Extract Ledger PDF
              </button>
           </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
           {/* Left: Application Timeline & Status */}
           <div className="lg:col-span-8 space-y-12">
              
              {/* Interactive Journey Tracker */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden"
              >
                 <div className="relative z-10">
                    <div className="flex justify-between items-center mb-16">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Live Status Synchronization</p>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Track Your Journey.</h2>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Protocol Reference</p>
                          <p className="text-sm font-black text-slate-900">STAGE_{application.status.toUpperCase()}</p>
                       </div>
                    </div>

                    {/* The Stepper */}
                    <div className="relative pt-12 pb-24">
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
                             { id: 'bank_selected', label: 'Integration', desc: 'Bank Connected', icon: Landmark },
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

                    {/* Stage Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 pt-12 border-t border-slate-50">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Identity Status</p>
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <p className="text-sm font-black text-slate-900">{application.personalInfo?.fullName}</p>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Subsidy Valve</p>
                          <p className={`text-sm font-black ${application.subsidyApproved > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {application.subsidyApproved > 0 ? `NPR ${application.subsidyApproved.toLocaleString()} UNLOCKED` : 'LOCKED / PENDING'}
                          </p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">System Latency</p>
                          <p className="text-sm font-black text-slate-900 uppercase">Operational</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mt-40" />
              </motion.div>

              {/* Document Repository */}
              <div className="space-y-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest ml-4">Secured Repository</h3>
                 <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { l: "Citizenship", n: "citizenshipDocument", i: ShieldCheck },
                      { l: "Income Proof", n: "incomeProofDocument", i: Wallet },
                      { l: "Property Ledger", n: "propertyDocument", i: Landmark }
                    ].map((doc, i) => (
                       <motion.div 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
                       >
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <doc.i size={24} />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">{doc.l}</h4>
                          {application[doc.n] ? (
                             <button 
                                onClick={() => {
                                   setPreviewUrl(getDocPreviewUrl(application[doc.n]));
                                   setRawPreviewUrl(getFileUrl(application[doc.n]));
                                }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                             >
                                Review File <Eye size={14} />
                             </button>
                          ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">File Missing</span>
                          )}
                       </motion.div>
                    ))}
                 </div>
              </div>

              {/* Bank Offers Section */}
              {application.bankOffers && application.bankOffers.length > 0 && (
                 <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest ml-4">Bank Integration Options</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                       {application.bankOffers.map((offer, i) => (
                          <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className={`bg-white rounded-[3rem] p-10 border shadow-sm relative overflow-hidden ${offer.status === 'accepted' ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-100'}`}
                          >
                             <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                   <Landmark size={28} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                                   offer.status === 'accepted' ? 'bg-indigo-600 text-white border-indigo-600' :
                                   offer.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                   'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                   {offer.status}
                                </span>
                             </div>
                             
                             <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{offer.bankName}</h4>
                             
                             <div className="grid grid-cols-2 gap-8 mb-10">
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Interest Rate</p>
                                   <p className="text-lg font-black text-slate-900">{offer.interestRate}% <span className="text-xs text-slate-300 font-medium">p.a.</span></p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly EMI</p>
                                   <p className="text-lg font-black text-emerald-600">NPR {offer.emi?.toLocaleString()}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Principal</p>
                                   <p className="text-sm font-black text-slate-900">NPR {offer.loanAmount?.toLocaleString()}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tenure</p>
                                   <p className="text-sm font-black text-slate-900">{offer.tenure} Years</p>
                                </div>
                             </div>

                             {offer.status === 'offered' && application.status !== 'bank_selected' && (
                                <button 
                                   onClick={() => handleAcceptOffer(offer._id)}
                                   disabled={accepting}
                                   className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                   {accepting ? 'Synchronizing...' : 'Authorize Integration'}
                                </button>
                             )}
                          </motion.div>
                       ))}
                    </div>
                 </div>
              )}
           </div>

           {/* Right: Sidebar Meta Info */}
           <div className="lg:col-span-4 space-y-12">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                 <Calendar className="text-blue-400 mb-8" size={32} />
                 <h4 className="text-xl font-black mb-4 tracking-tight">Audit Trail</h4>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-px bg-slate-800 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Modified</p>
                          <p className="text-xs font-bold text-slate-300">{new Date(application.updatedAt).toLocaleString()}</p>
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
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mb-16" />
              </div>

              {application.officerNotes && (
                 <div className="bg-amber-50 rounded-[3rem] p-10 border border-amber-100">
                    <div className="flex items-center gap-4 mb-6">
                       <Info className="text-amber-600" size={24} />
                       <h4 className="text-xs font-black uppercase tracking-widest text-amber-900">Officer Feedback</h4>
                    </div>
                    <p className="text-sm font-medium text-amber-800 leading-relaxed italic">
                       "{application.officerNotes}"
                    </p>
                 </div>
              )}
           </div>
        </div>

      </div>

      {/* Premium Document Preview Modal */}
      <AnimatePresence>
         {previewUrl && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 lg:p-12"
            >
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[3rem] w-full max-w-6xl h-full flex flex-col shadow-2xl overflow-hidden"
               >
                  <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                           <Eye size={24} />
                        </div>
                        <div>
                           <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Secure Preview</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read-only government document access</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <a 
                           href={rawPreviewUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="px-8 py-4 bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
                        >
                           External Access <ExternalLink size={14} />
                        </a>
                        <button 
                           onClick={() => setPreviewUrl(null)} 
                           className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-slate-900/20"
                        >
                           Close Dossier
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 bg-slate-100 p-1">
                     <iframe 
                        src={previewUrl} 
                        className="w-full h-full border-0 rounded-[2rem]" 
                        title="Document Preview" 
                     />
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationDetail;
