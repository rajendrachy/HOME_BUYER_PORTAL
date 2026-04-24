import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Info, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead } = useSocket() || { notifications: [], unreadCount: 0 };
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'error': return <XCircle size={16} className="text-rose-500" />;
      case 'warning': return <Clock size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col h-full max-h-[500px]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center">
            <Bell size={18} />
          </div>
          System Alerts
        </h3>
        {unreadCount > 0 && (
          <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {unreadCount} Unread
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
            <Bell size={32} className="opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Recent Alerts</p>
          </div>
        ) : (
          <AnimatePresence>
            {(notifications || []).slice(0, 5).map((notif) => {
              if (!notif || !notif._id) return null;
              return (
                <motion.div 
                  key={notif._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    if (!notif.isRead && typeof markAsRead === 'function') markAsRead(notif._id);
                    if (notif.link) navigate(notif.link);
                  }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                    notif.isRead 
                      ? 'border-slate-50 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200' 
                      : 'border-blue-100 bg-blue-50/30 shadow-sm'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${notif.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-sm ${notif.isRead ? 'text-slate-400 font-medium' : 'text-slate-600 font-bold'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-3">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
