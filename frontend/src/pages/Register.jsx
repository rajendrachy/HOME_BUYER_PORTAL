import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, ShieldCheck, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    citizenshipNumber: '',
    password: '',
    role: 'citizen',
    bankId: ''
  });
  
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'bank_officer') {
      loadBanks();
    }
  }, [formData.role]);

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await api.get('/banks');
      setBanks(response.data.banks);
    } catch (error) {
      console.error('Failed to load banks', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData = {
        ...formData,
        bankId: formData.role === 'bank_officer' ? formData.bankId : undefined
      };
      await register(registerData);
      toast.success("Account created successfully! Please login.");
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex lg:w-1/3 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
         <div className="absolute inset-0 z-0">
            <img 
               src="/images/hero-bg.png" 
               alt="Luxury Home" 
               className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-slate-900" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12 cursor-pointer" onClick={() => navigate("/")}>
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xl">
                  <Building2 size={24} />
               </div>
               <span className="text-xl font-black tracking-tighter text-white">HomeBuyer<span className="text-blue-500">.</span></span>
            </div>
            
            <h1 className="text-4xl font-black text-white leading-tight tracking-tighter mb-6">
               Start Your Home <br />Ownership Journey.
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed">
               Join thousands of citizens who have successfully secured their dream homes with our platform.
            </p>
         </div>

         <div className="relative z-10 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-4">
               <ShieldCheck className="text-blue-400" size={20} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Verified Platform</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
               Authorized by the Government of Nepal for digital subsidy management.
            </p>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 md:p-20 bg-slate-50/50 overflow-y-auto">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
         >
            <div className="mb-12">
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Create Professional Account</h2>
               <p className="text-slate-500 font-medium">Please provide your official details to register on the portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Full Name</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                           <User size={18} />
                        </div>
                        <input
                           name="name"
                           value={formData.name}
                           onChange={handleChange}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900"
                           placeholder="Arjun Karki"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Email Address</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                           <Mail size={18} />
                        </div>
                        <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900"
                           placeholder="arjun@example.com"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Phone Number</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                           <Phone size={18} />
                        </div>
                        <input
                           type="tel"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900"
                           placeholder="98XXXXXXXX"
                           required
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Citizenship Number</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                           <ShieldCheck size={18} />
                        </div>
                        <input
                           name="citizenshipNumber"
                           value={formData.citizenshipNumber}
                           onChange={handleChange}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900"
                           placeholder="XX-XX-XX-XXXXX"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Password</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                           <Lock size={18} />
                        </div>
                        <input
                           type="password"
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-slate-900"
                           placeholder="••••••••"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Register As</label>
                     <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none"
                        required
                     >
                        <option value="citizen">Citizen</option>
                        <option value="municipality_officer">Municipality Officer</option>
                        <option value="bank_officer">Bank Officer</option>
                     </select>
                  </div>
               </div>

               <div className="md:col-span-2">
                  {formData.role === 'bank_officer' && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-8"
                     >
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Assign to Bank</label>
                        <select
                           name="bankId"
                           value={formData.bankId}
                           onChange={handleChange}
                           className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none"
                           required
                        >
                           <option value="">Select your bank</option>
                           {banks.map(bank => (
                              <option key={bank._id} value={bank._id}>{bank.name} - {bank.branch}</option>
                           ))}
                        </select>
                        {loadingBanks && <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse">Syncing bank data...</p>}
                     </motion.div>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full btn-premium py-6 flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                     {loading ? 'Processing...' : (
                        <>
                           Create Secure Account
                           <ArrowRight size={20} />
                        </>
                     )}
                  </button>
               </div>
            </form>

            <div className="mt-12 text-center">
               <p className="text-sm font-medium text-slate-500">
                  Already have a professional account?{' '}
                  <Link to="/login" className="font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest text-[11px] ml-1">
                     Sign In
                  </Link>
               </p>
            </div>
         </motion.div>
      </div>
   </div>
  );
};

export default Register;