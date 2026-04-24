import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, submitLoanOffer } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Landmark, Wallet, TrendingUp, 
  Percent, Calendar, CreditCard, ArrowRight,
  ShieldCheck, Activity, Info, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '8.5',
    processingFee: '10000',
    tenure: '20',
    message: ''
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data } = await getApplicationById(id);
      setApplication(data.application);
      const suggestedLoan = data.application.property?.cost - (data.application.subsidyApproved || 0);
      setFormData(prev => ({
        ...prev,
        loanAmount: suggestedLoan.toString()
      }));
    } catch (err) {
      setError('System Error: Record access failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const calculateEMI = () => {
    const principal = parseFloat(formData.loanAmount);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const months = parseFloat(formData.tenure) * 12;
    if (isNaN(principal) || isNaN(rate) || isNaN(months) || principal <= 0) return 0;
    const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLoanOffer(id, {
        loanAmount: parseFloat(formData.loanAmount),
        interestRate: parseFloat(formData.interestRate),
        processingFee: parseFloat(formData.processingFee),
        tenure: parseFloat(formData.tenure),
        message: formData.message
      });
      toast.success('Mortgage offer successfully broadcasted to citizen ledger.');
      navigate('/bank/dashboard');
    } catch (err) {
      toast.error('Offer rejection: ' + (err.response?.data?.message || 'Protocol failure.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Initializing Structuring Module</p>
        </div>
      </div>
    );
  }

  const emi = calculateEMI();
  const propertyCost = application?.property?.cost || 0;
  const subsidyApproved = application?.subsidyApproved || 0;
  const remainingAmount = propertyCost - subsidyApproved;

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button 
                 onClick={() => navigate('/bank/dashboard')} 
                 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Return to Portfolio
              </button>
              <div className="flex items-center gap-6 mb-4">
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Structuring.
                 </h1>
                 <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                    Offer Entry
                 </div>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-lg">
                 Configure mortgage terms for dossier #{application.applicationId}.
              </p>
           </motion.div>
        </div>

        {/* Financial Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           {[
             { l: "Asset Valuation", v: propertyCost, i: Landmark, c: "text-slate-900" },
             { l: "Approved Subsidy", v: subsidyApproved, i: ShieldCheck, c: "text-emerald-600" },
             { l: "Target Principal", v: remainingAmount, i: Activity, c: "text-indigo-600" }
           ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">{item.l}</p>
                 <p className={`text-2xl font-black ${item.c} tracking-tight`}>NPR {item.v.toLocaleString()}</p>
              </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
           
           {/* Left: Configuration Form */}
           <div className="lg:col-span-7">
              <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm"
              >
                 <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Loan Principal (NPR)</label>
                          <div className="relative">
                             <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <input
                                type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-600/5 font-black text-lg text-slate-900"
                                required
                             />
                          </div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase ml-1">Suggested: NPR {remainingAmount.toLocaleString()}</p>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Interest Rate (% p.a.)</label>
                          <div className="relative">
                             <Percent className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <input
                                type="number" step="0.1" name="interestRate" value={formData.interestRate} onChange={handleChange}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-600/5 font-black text-lg text-slate-900"
                                required
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Processing Fee (NPR)</label>
                          <div className="relative">
                             <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <input
                                type="number" name="processingFee" value={formData.processingFee} onChange={handleChange}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-600/5 font-black text-lg text-slate-900"
                                required
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Term (Years)</label>
                          <div className="relative">
                             <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <select
                                name="tenure" value={formData.tenure} onChange={handleChange}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-indigo-600/5 font-black text-lg text-slate-900 appearance-none cursor-pointer"
                                required
                             >
                                {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} Years</option>)}
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                       <button 
                          type="submit" disabled={submitting}
                          className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                       >
                          {submitting ? 'Broadcasting Offer...' : 'Commit Mortgage Offer'}
                          <ArrowRight size={18} />
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>

           {/* Right: Live Projections */}
           <div className="lg:col-span-5">
              <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                 className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl sticky top-32 overflow-hidden"
              >
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                          <BarChart3 size={20} />
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-widest">Live Projection</h3>
                    </div>

                    <div className="space-y-12 mb-16">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Estimated Monthly Repayment</p>
                          <p className="text-6xl font-black tracking-tighter text-indigo-400">
                             NPR {emi.toLocaleString()}
                          </p>
                       </div>

                       <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Interest Component</p>
                             <p className="text-lg font-bold text-slate-100">{formData.interestRate}%</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Term</p>
                             <p className="text-lg font-bold text-slate-100">{formData.tenure} Years</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                       <div className="flex items-center gap-3 mb-4">
                          <Info size={16} className="text-indigo-400" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Disclosure</h4>
                       </div>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Projections are based on standard amortization schedules. Final figures may vary based on exact disbursement date and localized regulatory taxes.
                       </p>
                    </div>
                 </div>
                 
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -ml-32 -mb-32" />
              </motion.div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default SubmitOffer;
