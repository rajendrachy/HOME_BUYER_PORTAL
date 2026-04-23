import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [userId, setUserId] = useState(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  
  const { login, verifyLogin2FA, recover2FA } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = (user) => {
    toast.success(`Welcome back, ${user.name || user.email}!`);
    if (user.role === 'citizen') navigate('/citizen/dashboard');
    else if (user.role === 'municipality_officer') navigate('/officer/dashboard');
    else if (user.role === 'bank_officer') navigate('/bank/dashboard');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recover2FA(email, recoveryCode);
      toast.success('Identity protection layer deactivated. Please login with your password.');
      setRequires2FA(false);
      setIsRecoveryMode(false);
      setRecoveryCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRecoveryMode) return handleRecovery(e);
    
    setError('');
    setLoading(true);

    try {
      if (requires2FA) {
        const user = await verifyLogin2FA(userId, twoFactorToken);
        handleRedirect(user);
      } else {
        const response = await login(email, password);
        if (response.requires2FA) {
          setRequires2FA(true);
          setUserId(response.userId);
          toast('Please enter your 2FA code', { icon: '🔐' });
        } else {
          handleRedirect(response);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Authentication failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-20">
         <div className="absolute inset-0 z-0">
            <img 
               src="/images/hero-bg.png" 
               alt="Luxury Home" 
               className="w-full h-full object-cover opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-slate-900" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12 cursor-pointer" onClick={() => navigate("/")}>
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                  <Building2 size={28} />
               </div>
               <span className="text-2xl font-black tracking-tighter text-white">
                  HomeBuyer<span className="text-blue-500">.</span>
               </span>
            </div>
            
            <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-8">
               Secure Access to <br />Your Future Home.
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-md">
               Manage your applications, track subsidies, and explore bank offers in one professional environment.
            </p>
         </div>

         <div className="relative z-10">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
               <div className="flex items-center gap-4 mb-4">
                  <ShieldCheck className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Government Grade Security</span>
               </div>
               <p className="text-slate-400 text-sm font-medium">
                  Your data is protected by AES-256 encryption and biometric-ready 2FA verification.
               </p>
            </div>
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-slate-50/50">
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="w-full max-w-md"
          >
             <div className="mb-12">
               <div className="lg:hidden flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                     <Building2 size={24} />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-slate-900">HomeBuyer.</span>
               </div>
               <h2 className="text-5xl font-black text-slate-900 mb-5 tracking-[-0.03em] leading-tight">
                  {isRecoveryMode ? 'Account Recovery' : requires2FA ? 'Identity Verification' : 'Welcome Back'}
               </h2>
               <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm">
                  {isRecoveryMode 
                    ? 'Enter an 8-digit recovery code to deactivate the security protocol.' 
                    : requires2FA 
                      ? 'Please enter your 6-digit cryptographic security token.' 
                      : 'Sign in to access your administrative and personal housing portal.'
                  }
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               <AnimatePresence mode="wait">
                  {!requires2FA && !isRecoveryMode ? (
                     <motion.div 
                        key="login"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8"
                     >
                        <div className="space-y-3">
                           <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Portal Email Node</label>
                           <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                 <Mail size={22} />
                              </div>
                              <input
                                 type="email"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-[10px] focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-slate-900 text-lg shadow-sm placeholder:text-slate-200"
                                 placeholder="active@node.com"
                                 required
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between items-center px-1">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Security Passkey</label>
                              <Link to="/forgot-password" size={12} className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Lost Key?</Link>
                           </div>
                           <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                 <Lock size={22} />
                              </div>
                              <input
                                 type="password"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                                 className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-[10px] focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-slate-900 text-lg shadow-sm placeholder:text-slate-200"
                                 placeholder="••••••••"
                                 required
                              />
                           </div>
                        </div>
                     </motion.div>
                  ) : requires2FA && !isRecoveryMode ? (
                     <motion.div 
                        key="2fa"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                     >
                        <div className="relative group">
                           <input
                              type="text"
                              value={twoFactorToken}
                              onChange={(e) => {
                                 const val = e.target.value.replace(/[^0-9]/g, '');
                                 setTwoFactorToken(val);
                              }}
                              className="w-full py-10 bg-white border-2 border-slate-100 rounded-[3rem] focus:outline-none focus:ring-[15px] focus:ring-blue-600/5 focus:border-blue-600 transition-all text-center text-6xl tracking-[0.6em] font-black placeholder:text-slate-50 text-slate-900"
                              placeholder="000000"
                              maxLength={6}
                              required
                              autoFocus
                           />
                        </div>
                        <div className="mt-10 flex justify-between items-center">
                           <button 
                              type="button"
                              onClick={() => setRequires2FA(false)}
                              className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                           >
                              <ChevronLeft size={16} /> Identity Switch
                           </button>
                           <button 
                              type="button"
                              onClick={() => setIsRecoveryMode(true)}
                              className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-colors"
                           >
                              Lost Security Device?
                           </button>
                        </div>
                     </motion.div>
                  ) : (
                    <motion.div 
                        key="recovery"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8"
                     >
                        <div className="space-y-3">
                           <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hardware Recovery Token</label>
                           <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                 <ShieldCheck size={24} />
                              </div>
                              <input
                                 type="text"
                                 value={recoveryCode}
                                 onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                 className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-[10px] focus:ring-blue-600/5 focus:border-blue-600 transition-all font-black text-blue-600 tracking-[0.3em] text-lg shadow-sm placeholder:text-slate-100"
                                 placeholder="XXXXXXXX"
                                 maxLength={8}
                                 required
                                 autoFocus
                              />
                           </div>
                        </div>
                        <button 
                           type="button"
                           onClick={() => setIsRecoveryMode(false)}
                           className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                        >
                           <ChevronLeft size={16} /> Back to MFA
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 hover:-translate-y-2 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
               >
                  {loading ? (
                    <div className="w-8 h-8 border-[5px] border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                       {isRecoveryMode 
                         ? 'Deactivate Protection Layer' 
                         : requires2FA 
                           ? 'Authorize Portal Entry' 
                           : 'Synchronize Portal'
                       }
                       <ArrowRight size={22} />
                    </>
                  )}
               </button>
            </form>

            <div className="mt-16">
               <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-slate-200/60"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.4em]">
                     <span className="bg-[#fafbfc] px-6 text-slate-300">Operational Nodes</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-5 mt-10">
                  {[
                    { r: "Citizen", e: "hari@gmail.com", p: "password123" },
                    { r: "Municipal", e: "officer@kmc.gov.np", p: "password123" },
                    { r: "Bank Unit", e: "manager@nimb.com.np", p: "password123" },
                    { r: "Command", e: "admin@portal.gov.np", p: "password123" }
                  ].map((cred, i) => (
                    <div key={i} className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-500/30 transition-all duration-500">
                       <p className="font-black text-blue-600 uppercase tracking-widest text-[9px] mb-2">{cred.r}</p>
                       <p className="text-slate-900 font-bold text-[10px] mb-1 truncate">{cred.e}</p>
                       <p className="text-slate-300 font-black text-[9px]">ID: password123</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-16 text-center">
               <p className="text-sm font-medium text-slate-400">
                  New to the government network?{' '}
                  <Link to="/register" className="font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.2em] text-[11px] ml-2">
                     Initialize Account
                  </Link>
               </p>
            </div>
         </motion.div>
      </div>
    </div>
  );
};

export default Login;