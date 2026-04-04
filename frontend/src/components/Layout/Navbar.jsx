import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || { notifications: [], unreadCount: 0 };

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

  return (
    <nav className="bg-blue-600 text-white shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition" aria-label="Home Buyer Portal Home">
            🏠 Home Buyer Portal
          </Link>

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="w-6 h-0.5 bg-white"></span>
            <span className="w-6 h-0.5 bg-white"></span>
            <span className="w-6 h-0.5 bg-white"></span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link
              to="/track"
              className={`py-2 px-1 transition ${
                isActive('/track')
                  ? 'text-white border-b-2 border-white'
                  : 'hover:text-blue-200'
              }`}
              aria-current={isActive('/track') ? 'page' : undefined}
            >
              Track Application
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`py-2 px-1 transition ${
                    isActive(getDashboardLink())
                      ? 'text-white border-b-2 border-white'
                      : 'hover:text-blue-200'
                  }`}
                  aria-current={isActive(getDashboardLink()) ? 'page' : undefined}
                >
                  Dashboard
                </Link>

                {/* NOTIFICATION BELL */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-white hover:text-blue-200 focus:outline-none transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center text-gray-800">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif._id);
                                if (notif.link) {
                                  navigate(notif.link);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                            >
                              <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  to="/profile" 
                  className={`py-2 px-1 transition ${isActive('/profile') ? 'text-white border-b-2 border-white' : 'hover:text-blue-200'} flex items-center`}
                >
                  <span className="text-sm font-medium mr-1">👤</span>
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-600 transition shadow-sm"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`py-2 px-1 transition ${
                    isActive('/login')
                      ? 'text-white border-b-2 border-white'
                      : 'hover:text-blue-200'
                  }`}
                  aria-current={isActive('/login') ? 'page' : undefined}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
                  aria-label="Register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-blue-500 pt-4 space-y-3">
            <Link
              to="/track"
              className={`block py-2 px-1 transition ${
                isActive('/track')
                  ? 'text-white bg-blue-700 px-3 rounded'
                  : 'hover:text-blue-200'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Application
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`block py-2 px-1 transition ${
                    isActive(getDashboardLink())
                      ? 'text-white bg-blue-700 px-3 rounded'
                      : 'hover:text-blue-200'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {/* Mobile Notification Area */}
                <div className="py-2 px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="bg-blue-700/50 rounded-lg p-2 max-h-40 overflow-y-auto">
                     {notifications.length === 0 ? (
                        <p className="text-sm text-blue-200">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 5).map(notif => (
                          <div key={notif._id} className="text-sm py-1 border-b border-blue-600/50 last:border-0" onClick={() => { if (!notif.isRead) markAsRead(notif._id); if (notif.link) navigate(notif.link); setMobileMenuOpen(false); }}>
                            <span className={notif.isRead ? "text-gray-300" : "text-white font-semibold"}>{notif.title}</span>
                          </div>
                        ))
                      )}
                  </div>
                </div>

                <div className="text-sm py-2 border-t border-blue-500 mt-2">👤 {user.name}</div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 transition shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block py-2 px-1 transition ${
                    isActive('/login')
                      ? 'text-white bg-blue-700 px-3 rounded'
                      : 'hover:text-blue-200'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-green-500 px-3 py-2 rounded hover:bg-green-600 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
