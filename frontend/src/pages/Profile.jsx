import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, Mail, Phone, 
  BadgeCheck, Settings, Lock, Smartphone,
  ChevronRight, AlertTriangle, Key, QrCode,
  Camera, Save, X, Eye, EyeOff, Loader2,
  Building2, MapPin, Globe, CreditCard
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // Tabs: 'identity', 'security'
  const [activeTab, setActiveTab] = useState('identity');
  
  // Identity State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA State
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  
  // Image State
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setIsUploadingImage(true);
    try {
      const { data } = await api.uploadProfileImage(formData);
      updateUser({ profileImage: data.profileImage });
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.updateProfile({ name, email, phone });
      updateUser(res.data);
      toast.success('Identity updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsUpdatingPassword(true);
    try {
      const res = await api.updateProfile({ password: newPassword });
      updateUser({ token: res.data.token });
      toast.success('Security credentials updated');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setIs2FALoading(true);
    try {
      const { data } = await api.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShow2FASetup(true);
    } catch (err) {
      toast.error('Could not initialize security protocols');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FALoading(true);
    try {
      const { data } = await api.verify2FA(twoFactorToken);
      toast.success('Encryption layer enabled successfully');
      setShow2FASetup(false);
      setRecoveryCodes(data.recoveryCodes || []);
      setShowRecoveryCodes(true);
      updateUser({ isTwoFactorEnabled: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid security token');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to reduce your account security?')) return;
    setIs2FALoading(true);
    try {
      await api.disable2FA();
      toast.success('Security layer adjusted');
      updateUser({ isTwoFactorEnabled: false });
    } catch (err) {
      toast.error('Failed to update security preferences');
    } finally {
      setIs2FALoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'bank_officer': return <Building2 size={14} />;
      case 'municipality_officer': return <Globe size={14} />;
      case 'admin': return <ShieldCheck size={14} />;
      default: return <User size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-[-10%] w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Profile Header Card */}
        <div className="relative mb-12">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white/80 backdrop-blur-2xl rounded-[4rem] p-8 lg:p-20 border border-white shadow-2xl shadow-blue-900/5 relative overflow-hidden"
           >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -mr-80 -mt-80" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                 {/* Avatar Upload Section */}
                 <div className="relative group">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      onClick={handleImageClick}
                      className="w-56 h-56 rounded-[4rem] bg-slate-900 overflow-hidden shadow-2xl cursor-pointer relative border-[8px] border-white"
                    >
                       {isUploadingImage ? (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                            <Loader2 size={48} className="text-white animate-spin" />
                         </div>
                       ) : null}
                       
                       {user?.profileImage ? (
                         <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-slate-900 to-slate-800">
                            <span className="text-7xl font-black">{user?.name?.charAt(0)}</span>
                         </div>
                       )}
                       
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white gap-3 backdrop-blur-md">
                          <Camera size={36} />
                          <span className="text-[11px] font-black uppercase tracking-[0.4em]">Update Avatar</span>
                       </div>
                    </motion.div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {/* Role Badge Floating */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center gap-3 border-4 border-white whitespace-nowrap">
                       <div className="text-blue-400">{getRoleIcon(user?.role)}</div>
                       {user?.role?.replace('_', ' ')}
                    </div>
                 </div>

                 {/* User Identity Overview */}
                 <div className="flex-1 text-center lg:text-left">
                     <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                        <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                           {getRoleIcon(user?.role)}
                           {user?.role?.replace('_', ' ')}
                        </div>
                        {user?.bankName && (
                          <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-blue-100">
                             Assignment: {user.bankName}
                          </div>
                        )}
                        {user?.municipalityId?.name && (
                          <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-indigo-100">
                             District: {user.municipalityId.name}
                          </div>
                        )}
                     </div>

                     <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6 justify-center lg:justify-start">
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9]">
                           {user?.name}
                        </h1>
                       <div className="flex items-center gap-3 px-5 py-2 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] w-fit mx-auto lg:mx-0 shadow-xl shadow-blue-600/20">
                          <ShieldCheck size={16} />
                          Authenticated
                       </div>
                    </div>
                    <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-2xl leading-relaxed mb-10">
                       Central Identity Protocol. Manage your professional credentials, secure hardware keys, and core profile metadata.
                    </p>
                    
                    <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                       <div className="flex items-center gap-3 px-8 py-4 bg-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 border border-slate-100 shadow-sm">
                          <Mail size={16} className="text-blue-600" />
                          {user?.email}
                       </div>
                       <div className="flex items-center gap-3 px-8 py-4 bg-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 border border-slate-100 shadow-sm">
                          <Phone size={16} className="text-emerald-600" />
                          +977 {user?.phone}
                       </div>
                       <div className="flex items-center gap-3 px-8 py-4 bg-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 border border-slate-100 shadow-sm">
                          <CreditCard size={16} className="text-indigo-600" />
                          ID: {user?.citizenshipNumber}
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-16 p-2.5 bg-white/50 backdrop-blur-xl rounded-[2.5rem] w-fit mx-auto lg:mx-0 border border-white shadow-xl shadow-blue-900/5">
           {[
             { id: 'identity', label: 'Identity Protocol', icon: User },
             { id: 'security', label: 'Access Control', icon: Lock },
             { id: 'activity', label: 'Global Audit', icon: BadgeCheck }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-4 px-10 py-5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
                 activeTab === tab.id 
                   ? 'bg-slate-900 text-white shadow-2xl scale-105' 
                   : 'text-slate-400 hover:text-slate-900 hover:bg-white'
               }`}
             >
                <tab.icon size={18} />
                {tab.label}
             </button>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
           
           {/* Main Content Area */}
           <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                 {activeTab === 'identity' && (
                    <motion.div 
                      key="identity"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-10"
                    >
                       <div className="bg-white rounded-[4rem] p-10 lg:p-20 border border-slate-50 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
                          <div className="flex items-center gap-5 mb-16">
                             <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-600/20">
                                <User size={28} />
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Identity Metadata</h3>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Synchronize with Federal Records</p>
                             </div>
                          </div>

                          <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-12">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Legal Designation</label>
                                <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-200 group-focus-within:text-blue-600 transition-colors">
                                      <User size={22} />
                                   </div>
                                   <input 
                                     type="text" 
                                     value={name}
                                     onChange={(e) => setName(e.target.value)}
                                     className="w-full pl-16 pr-8 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all font-black text-lg text-slate-900 tracking-tight"
                                     placeholder="Protocol Name"
                                   />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Communication Node</label>
                                <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-200 group-focus-within:text-blue-600 transition-colors">
                                      <Mail size={22} />
                                   </div>
                                   <input 
                                     type="email" 
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                     className="w-full pl-16 pr-8 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all font-black text-lg text-slate-900 tracking-tight"
                                     placeholder="active@node.com"
                                   />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Mobile Access Reference</label>
                                <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-200 group-focus-within:text-blue-600 transition-colors">
                                      <Phone size={22} />
                                   </div>
                                   <input 
                                     type="tel" 
                                     value={phone}
                                     onChange={(e) => setPhone(e.target.value)}
                                     className="w-full pl-16 pr-8 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all font-black text-lg text-slate-900 tracking-tight"
                                     placeholder="98XXXXXXXX"
                                   />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Citizen Key (Immutable)</label>
                                <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-100">
                                      <CreditCard size={22} />
                                   </div>
                                   <input 
                                     type="text" 
                                     value={user?.citizenshipNumber}
                                     disabled
                                     className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-lg text-slate-200 cursor-not-allowed tracking-widest"
                                   />
                                </div>
                             </div>

                             <div className="md:col-span-2 pt-8">
                                <button 
                                  type="submit" 
                                  disabled={isUpdatingProfile}
                                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                                >
                                   {isUpdatingProfile ? <Loader2 className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                   Commit Identity Changes
                                </button>
                             </div>
                          </form>
                       </div>

                       {/* Conditional: Bank/Municipality Info */}
                       {user?.role !== 'citizen' && (
                          <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden group shadow-2xl">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                                <div className="max-w-md">
                                   <div className="flex items-center gap-4 mb-6">
                                      <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                         <Building2 className="text-blue-400" size={24} />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400">Authority Allocation</span>
                                   </div>
                                   <h3 className="text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                                      {user?.role === 'bank_officer' ? user?.bankName : user?.municipalityId?.name}
                                   </h3>
                                   <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                      Professional domain authorized for your {user?.role?.replace('_', ' ')} directive.
                                   </p>
                                </div>
                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 group-hover:border-blue-500/50 transition-all duration-700 w-full md:w-auto text-center md:text-left backdrop-blur-md">
                                   <MapPin className="text-blue-400 mb-6 mx-auto md:mx-0" size={36} />
                                   <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-2">Station Coordinates</p>
                                   <p className="text-slate-400 text-lg font-black">{user?.role === 'bank_officer' ? 'Tier-1 Partner' : user?.municipalityId?.district || 'Federal Command'}</p>
                                </div>
                             </div>
                          </div>
                       )}
                    </motion.div>
                 )}

                 {activeTab === 'security' && (
                    <motion.div 
                      key="security"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-10"
                    >
                       <div className="bg-white rounded-[4rem] p-10 lg:p-20 border border-slate-50 shadow-2xl shadow-blue-900/5">
                          <div className="flex items-center gap-5 mb-16">
                             <div className="w-14 h-14 bg-rose-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-600/20">
                                <Lock size={28} />
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Access Protocol</h3>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Manage Sovereign Credentials</p>
                             </div>
                          </div>

                          <form onSubmit={handlePasswordChange} className="space-y-12">
                             <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">New Identity Token</label>
                                   <div className="relative group">
                                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-200 group-focus-within:text-rose-600 transition-colors">
                                         <Key size={22} />
                                      </div>
                                      <input 
                                        type={showPasswords ? "text" : "password"} 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-16 pr-16 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-rose-600/5 focus:border-rose-600 transition-all font-black text-lg text-slate-900 tracking-[0.5em]"
                                        placeholder="••••••••"
                                      />
                                      <button 
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-200 hover:text-slate-900 transition-colors"
                                      >
                                         {showPasswords ? <EyeOff size={22} /> : <Eye size={22} />}
                                      </button>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Confirm Identity Token</label>
                                   <div className="relative group">
                                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-200 group-focus-within:text-rose-600 transition-colors">
                                         <Key size={22} />
                                      </div>
                                      <input 
                                        type={showPasswords ? "text" : "password"} 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-16 pr-16 py-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-[12px] focus:ring-rose-600/5 focus:border-rose-600 transition-all font-black text-lg text-slate-900 tracking-[0.5em]"
                                        placeholder="••••••••"
                                      />
                                   </div>
                                </div>
                             </div>

                             <button 
                               type="submit" 
                               disabled={isUpdatingPassword || !newPassword}
                               className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                             >
                                {isUpdatingPassword ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                                Rotate Access Credentials
                             </button>
                          </form>
                       </div>

                       {/* 2FA Section */}
                       <div className="bg-white rounded-[4rem] p-10 lg:p-20 border border-slate-50 shadow-2xl shadow-blue-900/5 overflow-hidden relative">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-16 relative z-10">
                             <div className="flex-1">
                                <div className="flex items-center gap-5 mb-10">
                                   <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                      <Smartphone size={28} />
                                   </div>
                                   <div>
                                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Hardware Vault</h3>
                                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Encrypted Multi-Factor Protocol</p>
                                   </div>
                                </div>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 max-w-xl">
                                   Authorize portal synchronization with revolving cryptographic tokens. This biometric hardware layer prevents unauthorized infiltration even if credentials are compromised.
                                </p>
                                
                                {user?.isTwoFactorEnabled ? (
                                   <button onClick={handleDisable2FA} disabled={is2FALoading} className="px-12 py-6 border-2 border-rose-100 text-rose-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 transition-all duration-500">
                                      Deactivate Hardware Pair
                                   </button>
                                ) : (
                                   <button onClick={handleEnable2FA} disabled={is2FALoading} className="px-12 py-6 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/20 hover:bg-slate-900 transition-all duration-500">
                                      Initiate MFA Encryption
                                   </button>
                                )}
                             </div>

                             {show2FASetup && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="w-full md:w-[450px] bg-slate-50/50 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-2xl"
                                >
                                   <div className="text-center mb-10">
                                      <div className="flex justify-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8 group hover:scale-105 transition-transform duration-500">
                                         <img src={qrCode} alt="2FA" className="w-48 h-48" />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Manual Override Secret</p>
                                      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-indigo-100 justify-center shadow-sm">
                                         <code className="text-[13px] font-black text-indigo-900 tracking-[0.3em]">{secret}</code>
                                      </div>
                                   </div>

                                   <div className="space-y-8">
                                      <input
                                         type="text"
                                         maxLength={6}
                                         value={twoFactorToken}
                                         onChange={(e) => setTwoFactorToken(e.target.value.replace(/[^0-9]/g, ''))}
                                         className="w-full py-8 bg-white border border-slate-200 rounded-[2rem] focus:ring-[15px] focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-center text-5xl tracking-[0.6em] font-black text-slate-900"
                                         placeholder="000000"
                                      />
                                      <button 
                                        onClick={handleVerify2FA} 
                                        disabled={twoFactorToken.length !== 6 || is2FALoading}
                                        className="w-full py-6 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl disabled:opacity-50 hover:bg-indigo-600 transition-all duration-500"
                                      >
                                         Authenticate & Sync
                                      </button>
                                      <button onClick={() => setShow2FASetup(false)} className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-colors">
                                         Abort Synchronization
                                      </button>
                                   </div>
                                </motion.div>
                             )}

                             {showRecoveryCodes && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="w-full md:w-[550px] bg-slate-900 rounded-[4rem] p-12 lg:p-16 border border-slate-800 shadow-2xl relative overflow-hidden"
                                >
                                   <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                                   
                                   <div className="relative z-10">
                                      <div className="flex items-center gap-5 mb-10">
                                         <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-[1.5rem] flex items-center justify-center border border-blue-500/20">
                                            <ShieldCheck size={28} />
                                         </div>
                                         <div>
                                            <h3 className="text-3xl font-black text-white tracking-tight">Recovery Tokens</h3>
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5">Essential Emergency Access</p>
                                         </div>
                                      </div>
                                      
                                      <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                                         In the event of hardware loss, these unique tokens are the only mechanism to restore account synchronization. Store them in a secure, non-digital environment.
                                      </p>
                                      
                                      <div className="grid grid-cols-2 gap-4 mb-12">
                                         {recoveryCodes.map((code, idx) => (
                                           <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-center group hover:border-blue-500/50 transition-colors duration-500">
                                              <code className="text-base font-black text-blue-400 tracking-[0.2em]">{code}</code>
                                           </div>
                                         ))}
                                      </div>
                                      
                                      <button 
                                        onClick={() => setShowRecoveryCodes(false)}
                                        className="w-full py-6 bg-blue-600 text-white rounded-[1.75rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-600/20 hover:bg-white hover:text-slate-900 transition-all duration-700 mb-6"
                                      >
                                         Protocols Saved Successfully
                                      </button>
                                      
                                      <button 
                                        onClick={() => {
                                          const text = recoveryCodes.join('\n');
                                          navigator.clipboard.writeText(text);
                                          toast.success('Tokens synchronized to clipboard');
                                        }}
                                        className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-colors"
                                      >
                                         Copy to Secure Clipboard
                                      </button>
                                   </div>
                                </motion.div>
                              )}
                          </div>
                          
                          {/* Aesthetic Background Logic */}
                          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] -mr-40 -mb-40" />
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'activity' && (
                    <motion.div 
                      key="activity"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[4rem] p-20 border border-slate-50 shadow-2xl shadow-blue-900/5 flex flex-col items-center justify-center min-h-[500px] text-center"
                    >
                       <div className="w-32 h-32 bg-slate-50 text-slate-100 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
                          <BadgeCheck size={64} />
                       </div>
                       <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Audit Log Restricted</h3>
                       <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">
                          Historical session telemetry and transaction audits are currently undergoing secure maintenance synchronization.
                       </p>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Sidebar: Compliance & Status */}
           <div className="lg:col-span-4 space-y-10">
              <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 mb-10">Portal Compliance</h4>
                    <div className="space-y-8">
                       <div className="flex items-center gap-5">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-90">Identity Score: 98% Optimized</span>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
                          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-90">Security Protocol: Active</span>
                       </div>
                    </div>
                    
                    <div className="mt-16 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                       <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                          "Your identity profile is fully compliant with the National Housing Subsidy Regulatory Framework (v2.4.9)."
                       </p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40" />
              </div>

              <div className="bg-white rounded-[4rem] p-12 border border-slate-50 shadow-2xl shadow-blue-900/5">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Operational Directives</h4>
                 <div className="space-y-4">
                    {[
                      { t: "Legal Terms", i: Globe },
                      { t: "Privacy Protocol", i: ShieldCheck },
                      { t: "System Support", i: AlertTriangle }
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[1.75rem] transition-all duration-500 group">
                         <div className="flex items-center gap-5">
                            <item.i size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-500" />
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-900">{item.t}</span>
                         </div>
                         <ChevronRight size={16} className="text-slate-100 group-hover:text-blue-600 transition-all duration-500" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
   );
};

export default Profile;
