import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, updateApplicationStatus } from '../../services/api';
import { getFileUrl, getDocPreviewUrl } from '../../utils/fileConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, FileText, CheckCircle2, XCircle, 
  Info, ShieldCheck, User, Building2, 
  Wallet, Landmark, Eye, ExternalLink,
  ClipboardCheck, AlertTriangle, Scale
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    status: 'approved',
    subsidyApproved: '',
    officerNotes: ''
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
      setFormData({
        status: data.application.status || 'under_review',
        subsidyApproved: data.application.subsidyApproved || '',
        officerNotes: data.application.officerNotes || ''
      });
    } catch (err) {
      setError('System Error: Record retrieval failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateApplicationStatus(id, {
        status: formData.status,
        subsidyApproved: parseInt(formData.subsidyApproved),
        officerNotes: formData.officerNotes
      });
      toast.success('Dossier updated and synchronized with main ledger.');
      navigate('/officer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Record Stream</p>
        </div>
      </div>
    );
  }

  const maxSubsidy = application?.property?.cost * 0.15;
  const isCompliant = parseInt(formData.subsidyApproved) <= maxSubsidy;

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button 
                 onClick={() => navigate('/officer/dashboard')} 
                 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Return to Queue
              </button>
              <div className="flex items-center gap-6 mb-4">
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Review File.
                 </h1>
                 <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                    #{application.applicationId}
                 </div>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Official verification and subsidy allocation for citizen identity: {application.personalInfo?.fullName}.
              </p>
           </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
           
           {/* Left: Application Dossier */}
           <div className="lg:col-span-8 space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm"
              >
                 <div className="flex items-center gap-4 mb-16 pb-8 border-b border-slate-50">
                    <ClipboardCheck size={32} className="text-blue-600" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Dossier Integrity</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Column 1: Identity & Employment */}
                    <div className="space-y-12">
                       <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2">
                             <User size={14} /> Legal Identity
                          </h4>
                          <div className="space-y-4">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                <p className="text-sm font-bold text-slate-900">{application.personalInfo?.fullName}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Citizenship Ref</p>
                                <p className="text-sm font-bold text-slate-900">{application.personalInfo?.citizenshipNumber}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Reference</p>
                                <p className="text-sm font-bold text-slate-900">{application.personalInfo?.phone}</p>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2">
                             <Building2 size={14} /> Employment Verification
                          </h4>
                          <div className="space-y-4">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue Stream</p>
                                <p className="text-sm font-bold text-slate-900 capitalize">{application.employment?.type}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Yield</p>
                                <p className="text-sm font-bold text-slate-900">NPR {application.employment?.monthlyIncome?.toLocaleString()}</p>
                             </div>
                          </div>
                       </section>
                    </div>

                    {/* Column 2: Property & Financials */}
                    <div className="space-y-12">
                       <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2">
                             <Landmark size={14} /> Asset Valuation
                          </h4>
                          <div className="space-y-4">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location Ledger</p>
                                <p className="text-sm font-bold text-slate-900">{application.property?.district}, Ward {application.property?.ward}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Classification</p>
                                <p className="text-sm font-bold text-slate-900 capitalize">{application.property?.type}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certified Cost</p>
                                <p className="text-sm font-bold text-blue-600">NPR {application.property?.cost?.toLocaleString()}</p>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2">
                             <Wallet size={14} /> Subsidy Analysis
                          </h4>
                          <div className="space-y-4">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested Amount</p>
                                <p className="text-sm font-bold text-slate-900">NPR {application.subsidyRequested?.toLocaleString()}</p>
                             </div>
                             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Statutory Ceiling (15%)</p>
                                <p className="text-sm font-black text-blue-900">NPR {Math.floor(maxSubsidy).toLocaleString()}</p>
                             </div>
                          </div>
                       </section>
                    </div>
                 </div>
              </motion.div>

              {/* Document Review Hub */}
              <div className="space-y-8">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest ml-4">Evidence Repository</h3>
                 <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { l: "Citizenship Identity", n: "citizenshipDocument", i: ShieldCheck },
                      { l: "Income Certification", n: "incomeProofDocument", i: Wallet },
                      { l: "Property Registry", n: "propertyDocument", i: Landmark }
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
                          <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest leading-tight">{doc.l}</h4>
                          {application[doc.n] ? (
                             <a 
                                href={getDocPreviewUrl(application[doc.n])} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                             >
                                Audit File <Eye size={14} />
                             </a>
                          ) : (
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Not Uploaded</span>
                          )}
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Decision Engine Form */}
           <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl sticky top-32"
              >
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                       <Scale size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Decision Engine</h2>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Verification Status</label>
                       <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'under_review', l: 'Under Review', c: 'text-blue-600', bg: 'bg-blue-50', i: Info },
                            { id: 'approved', l: 'Authorize Approval', c: 'text-emerald-600', bg: 'bg-emerald-50', i: CheckCircle2 },
                            { id: 'rejected', l: 'Reject Application', c: 'text-rose-600', bg: 'bg-rose-50', i: XCircle }
                          ].map((opt) => (
                             <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, status: opt.id })}
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                                   formData.status === opt.id 
                                      ? `border-slate-900 ${opt.bg} ${opt.c}` 
                                      : 'border-slate-50 bg-white text-slate-400'
                                }`}
                             >
                                <opt.i size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.l}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Subsidy Allocation (NPR)</label>
                          {!isCompliant && (
                             <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 animate-pulse">
                                <AlertTriangle size={10} /> Violation
                             </span>
                          )}
                       </div>
                       <input
                          type="number"
                          name="subsidyApproved"
                          value={formData.subsidyApproved}
                          onChange={handleChange}
                          className={`w-full p-6 rounded-2xl font-black text-2xl tracking-tight transition-all focus:ring-4 ${
                             !isCompliant 
                                ? 'bg-rose-50 border-rose-100 text-rose-600 focus:ring-rose-500/5' 
                                : 'bg-slate-50 border-transparent focus:border-slate-100 text-slate-900 focus:ring-slate-900/5'
                          }`}
                          placeholder="0.00"
                       />
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 ml-1">
                          Threshold: NPR {Math.floor(maxSubsidy).toLocaleString()}
                       </p>
                    </div>

                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Operational Notes</label>
                       <textarea
                          name="officerNotes"
                          value={formData.officerNotes}
                          onChange={handleChange}
                          rows="4"
                          className="w-full p-6 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-slate-900/5 font-medium text-slate-700 text-sm"
                          placeholder="Internal reasoning for decision..."
                       />
                    </div>

                    <button 
                       type="submit" 
                       disabled={submitting || !isCompliant}
                       className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       {submitting ? 'Synchronizing Mainframe...' : 'Commit Decision'}
                    </button>
                 </form>
              </motion.div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default ApplicationReview;
