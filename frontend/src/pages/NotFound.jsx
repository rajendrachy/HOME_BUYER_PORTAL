import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 inline-flex items-center justify-center w-24 h-24 bg-rose-50 text-rose-600 rounded-[2rem] shadow-xl shadow-rose-600/10"
        >
          <ShieldAlert size={48} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl lg:text-9xl font-black text-slate-900 mb-8 tracking-tighter"
        >
          404<span className="text-blue-600">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl text-slate-500 font-medium mb-12 max-w-md mx-auto"
        >
          The resource you are attempting to access does not exist within the government portal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} />
            Previous State
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-premium flex items-center justify-center gap-3"
          >
            <Home size={18} />
            Central Hub
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
