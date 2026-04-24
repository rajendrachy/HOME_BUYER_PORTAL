import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Landmark, CheckCircle2, AlertTriangle, ArrowRight, Clock, Coffee, MessageSquare } from 'lucide-react';
import { formatTimeElapsed } from '../utils/timeFormat';

const WorkflowGuide = ({ role, status, lastUpdate, count = 0 }) => {
  const [urgency, setUrgency] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const steps = [
    { id: 'pending', label: 'Submission', icon: FileText, next: 'Officer Audit' },
    { id: 'under_review', label: 'Review', icon: Search, next: 'Bank Bidding' },
    { id: 'approved', label: 'Bidding', icon: Landmark, next: 'Citizen Selection' },
    { id: 'bank_selected', label: 'Selection', icon: CheckCircle2, next: 'Municipality Finalization' },
    { id: 'completed', label: 'Finalized', icon: CheckCircle2, next: 'Archive' }
  ];

  useEffect(() => {
    if (!lastUpdate || count === 0) {
      setUrgency(false);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date() - new Date(lastUpdate)) / 1000);
      setSecondsElapsed(elapsed);
      if (elapsed > 60) setUrgency(true);
      else setUrgency(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate, count]);

  if (count === 0 && role !== 'citizen') {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center mb-12">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
          <Coffee size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Registry Standby</h3>
        <p className="text-sm font-medium text-slate-400 max-w-xs uppercase tracking-widest text-[10px]">No active dossiers require your intervention at this time.</p>
      </div>
    );
  }

  const activeIdx = steps.findIndex(s => s.id === status);
  const currentStep = steps[activeIdx] || steps[0];
  const nextStep = steps[activeIdx + 1] || null;

  const getDutyMessage = () => {
    if (role === 'citizen') {
      if (status === 'pending') return { task: 'Wait for Verification', color: 'text-emerald-500', icon: Clock, isWaiting: true };
      if (status === 'under_review') return { task: 'Audit in Progress', color: 'text-blue-500', icon: Search, isWaiting: true };
      if (status === 'approved') return { task: 'Choose Your Bank', color: 'text-rose-500', icon: Landmark, isWorking: true };
      if (status === 'bank_selected') return { task: 'Waiting for Final Grant', color: 'text-emerald-500', icon: Clock, isWaiting: true };
      if (status === 'completed') return { task: 'Grant Disbursed', color: 'text-slate-400', icon: CheckCircle2 };
    }
    if (role === 'municipality_officer') {
      if (status === 'pending') return { task: `Review ${count} New Application(s)`, color: 'text-rose-500', icon: AlertTriangle, isWorking: true };
      if (status === 'under_review') return { task: `Finalize ${count} Audit Report(s)`, color: 'text-rose-500', icon: FileText, isWorking: true };
      if (status === 'bank_selected') return { task: `Finalize ${count} Grant Disbursement(s)`, color: 'text-rose-500', icon: AlertTriangle, isWorking: true };
      if (status === 'completed') return { task: 'Grant Disbursed', color: 'text-emerald-500', icon: CheckCircle2, isWaiting: true };
    }
    if (role === 'bank_officer') {
      if (status === 'approved') return { task: `Submit Offer for ${count} Lead(s)`, color: 'text-rose-500', icon: Landmark, isWorking: true };
      if (status === 'bank_selected') return { task: `Waiting for Municipality Finalization`, color: 'text-emerald-500', icon: Clock, isWaiting: true };
      if (status === 'completed') return { task: 'Grant Disbursed', color: 'text-emerald-500', icon: CheckCircle2, isWaiting: true };
    }
    return { task: 'Synchronizing...', color: 'text-slate-400', icon: Clock };
  };

  const duty = getDutyMessage();

  return (
    <div className="space-y-6 mb-12">
      <AnimatePresence>
        {urgency && status !== 'completed' && count > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-600 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-2xl shadow-rose-600/30 border-2 border-rose-400/50 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Action Required Immediately</p>
                <h4 className="text-lg font-black tracking-tight">Latency Alert: {count} dossiers pending for {formatTimeElapsed(secondsElapsed)}</h4>
              </div>
            </div>
            <div className="px-6 py-2 bg-white text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest">
              High Priority
            </div>
          </motion.div>
        )}

        {!urgency && duty.isWaiting && count > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-600 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-2xl shadow-emerald-600/30 border-2 border-emerald-400/50 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">System Message</p>
                <h4 className="text-lg font-black tracking-tight">{duty.task}</h4>
              </div>
            </div>
            <div className="px-6 py-2 bg-white text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
              Standing By
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10">
          {/* Duty & Next Step Header */}
          <div className="grid md:grid-cols-2 gap-10 mb-12 border-b border-slate-800 pb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Your Current Duty</p>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-white/5 ${duty.color}`}>
                  <duty.icon size={28} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${duty.color}`}>{duty.task}</h3>
                  <p className="text-xs font-bold text-slate-400">Status: {status.toUpperCase().replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">Pipeline Intelligence: Next Step</p>
              {nextStep ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                      <ArrowRight size={16} />
                    </div>
                    <p className="text-sm font-black text-white">{nextStep.next}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Automated Transition</span>
                </div>
              ) : (
                <p className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Protocol Fully Executed
                </p>
              )}
            </div>
          </div>

          {/* Progress Visualizer */}
          <div className="flex justify-between items-center relative px-4">
            <div className="absolute top-6 left-0 w-full h-[2px] bg-slate-800" />
            <div 
              className="absolute top-6 left-0 h-[2px] bg-blue-600 transition-all duration-1000" 
              style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => {
              const isCompleted = idx < activeIdx;
              const isActive = idx === activeIdx;
              return (
                <div key={step.id} className="relative flex flex-col items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                    isCompleted ? 'bg-blue-600 border-blue-400 text-white' :
                    isActive ? 'bg-white border-blue-600 text-blue-600 scale-125' :
                    'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <div className="text-center hidden md:block">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -ml-32 -mb-32" />
      </div>
    </div>
  );
};

export default WorkflowGuide;
