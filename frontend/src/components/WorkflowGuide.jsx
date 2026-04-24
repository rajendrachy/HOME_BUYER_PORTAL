import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Landmark, CheckCircle2, ArrowRight } from 'lucide-react';

const WorkflowGuide = ({ role, status }) => {
  const steps = [
    { id: 'pending', label: 'Submission', icon: FileText, desc: 'Application filed by citizen.' },
    { id: 'under_review', label: 'Review', icon: Search, desc: 'Municipality officer verification.' },
    { id: 'approved', label: 'Bidding', icon: Landmark, desc: 'Banks submitting loan offers.' },
    { id: 'bank_selected', label: 'Selection', icon: CheckCircle2, desc: 'Citizen chooses preferred bank.' },
    { id: 'completed', label: 'Finalized', icon: CheckCircle2, desc: 'Grant disbursed & closed.' }
  ];

  const getActiveStep = () => {
    const idx = steps.findIndex(s => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  const activeIdx = getActiveStep();

  const getMessage = () => {
    if (role === 'citizen') {
      if (status === 'pending') return 'Waiting for municipality review. Keep your documents ready.';
      if (status === 'under_review') return 'Officer is auditing your dossier. Check back soon.';
      if (status === 'approved') return 'Great! Banks are now bidding. Review offers below.';
      if (status === 'bank_selected') return 'Offer accepted! Waiting for final municipality disbursement.';
      if (status === 'completed') return 'Congratulations! Your subsidy journey is complete.';
    }
    if (role === 'municipality_officer') {
      if (status === 'pending') return 'New application received. Please initiate verification.';
      if (status === 'under_review') return 'Dossier audit in progress. Approve when compliant.';
      if (status === 'approved') return 'Approved! Banks are currently providing offers.';
      if (status === 'bank_selected') return 'Citizen accepted an offer. Finalize now to disburse grant.';
      if (status === 'completed') return 'Dossier finalized and archived.';
    }
    if (role === 'bank_officer') {
      if (status === 'approved') return 'New lead! Submit a competitive offer to win.';
      if (status === 'bank_selected') return 'Offer status updated. Check results in My Offers.';
    }
    return 'Synchronizing with mainframe...';
  };

  return (
    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden mb-12 shadow-2xl shadow-slate-900/20">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Protocol Execution Guide</p>
            <h2 className="text-3xl font-black tracking-tight">Status: {status.replace('_', ' ').toUpperCase()}</h2>
          </div>
          <div className="bg-blue-600 px-6 py-3 rounded-2xl">
            <p className="text-sm font-black italic">" {getMessage()} "</p>
          </div>
        </div>

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
              <div key={step.id} className="relative flex flex-col items-center gap-4">
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
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
    </div>
  );
};

export default WorkflowGuide;
