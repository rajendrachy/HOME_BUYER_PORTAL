import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, User, LogOut, Menu, X, 
  Search, ShieldCheck, Activity,
  ChevronDown, MessageSquare,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || { notifications: [], unreadCount: 0 };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'citizen': return '/citizen/dashboard';
      case 'municipality_officer': return '/officer/dashboard';
      case 'bank_officer': return '/bank/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const navLinks = [
    { label: 'Market Feed', path: '/', icon: Activity },
    { label: 'Track Ledger', path: '/track', icon: Search }
  ];

  if (user) {
    navLinks.push({ label: 'Command Center', path: getDashboardLink(), icon: LayoutDashboard });
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-sans ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-slate-100' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter leading-none block text-slate-900">
                HomeBuyer
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 block leading-none mt-1">
                Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8 mr-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${
                    isActive(link.path) ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {user ? (
              <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      showNotifications ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
                      >
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Feed</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                              Flush All
                            </button>
                          )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                              <MessageSquare size={32} className="text-slate-100 mx-auto mb-4" />
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">All Clear</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div 
                                key={notif._id} 
                                onClick={() => {
                                  if (!notif.isRead) markAsRead(notif._id);
                                  if (notif.link) { navigate(notif.link); setShowNotifications(false); }
                                }}
                                className={`p-8 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${!notif.isRead ? 'bg-blue-50/20' : 'bg-white'}`}
                              >
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${notif.isRead ? 'text-slate-400 line-through' : 'text-blue-600'}`}>{notif.title}</p>
                                <p className={`text-sm font-bold leading-snug ${notif.isRead ? 'text-slate-400 line-through opacity-60' : 'text-slate-900'}`}>{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                 <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-4 group"
                    >
                       <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm uppercase shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-transform overflow-hidden">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.charAt(0) || 'U'
                          )}
                       </div>
                      <div className="text-left hidden xl:block">
                         <span className="text-xs font-black text-slate-900 block leading-none">
                            {user?.name?.split(' ')[0] || 'User'}
                         </span>
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mt-1">
                            {user?.role?.replace('_', ' ') || 'Profile'}
                         </span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                   </button>

                   <AnimatePresence>
                      {showUserMenu && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 py-3"
                         >
                            {[
                              { label: 'Control Center', path: getDashboardLink(), icon: LayoutDashboard },
                              { label: 'Identity Hub', path: '/profile', icon: User }
                            ].map((item) => (
                               <Link 
                                 key={item.path} 
                                 to={item.path} 
                                 onClick={() => setShowUserMenu(false)}
                                 className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                               >
                                  <item.icon size={16} className="text-slate-400" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.label}</span>
                               </Link>
                            ))}
                            <div className="h-px bg-slate-50 mx-6 my-2" />
                            <button 
                               onClick={handleLogout}
                               className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors group"
                            >
                               <LogOut size={16} className="text-rose-400 group-hover:text-rose-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Terminate Session</span>
                            </button>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-8 py-4 hover:bg-slate-50 rounded-xl transition-all">
                  Initialize
                </Link>
                <Link to="/register" className="btn-premium px-8 py-4 text-[10px]">
                  Onboard Identity
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className="lg:hidden w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xl shadow-slate-900/10"
          >
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[101]"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[102] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400">Navigation</span>
                 <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <X size={20} className="text-slate-900" />
                 </button>
              </div>
              
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isActive(link.path) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <link.icon size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                {user ? (
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase overflow-hidden">
                           {user?.profileImage ? (
                             <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                           ) : (
                             user?.name?.charAt(0) || 'U'
                           )}
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-900 truncate">{user?.name || 'User'}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user?.role || 'Guest'}</p>
                        </div>
                     </div>
                     <div className="grid gap-2">
                        <Link 
                           to="/profile" 
                           onClick={() => setMobileMenuOpen(false)}
                           className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                           <User size={18} className="text-slate-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Identity Hub</span>
                        </Link>
                        <button 
                           onClick={handleLogout} 
                           className="w-full flex items-center gap-4 p-4 text-rose-600 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 rounded-xl transition-colors"
                        >
                           <LogOut size={18} /> Sign Out
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                     <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 bg-slate-50 text-slate-900 text-center rounded-xl font-black uppercase tracking-widest text-[10px]">
                        Sign In
                     </Link>
                     <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 bg-blue-600 text-white text-center rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20">
                        Create Account
                     </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
