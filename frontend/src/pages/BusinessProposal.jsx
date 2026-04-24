import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, ShieldCheck, Zap, Users, 
  ArrowRight, Building2, Globe, Lock, 
  Handshake, PieChart, Briefcase, Download,
  CheckCircle2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessProposal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-blue-600 selection:text-white font-sans pt-20">
      
      {/* Premium Light Header */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-full mb-10 border border-blue-100 shadow-sm">
              <Briefcase size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Partnership Proposal</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black mb-10 leading-[0.9] tracking-tighter text-slate-900">
              Transforming Nepal's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Housing Economy.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-16 font-medium">
              A high-fidelity digital infrastructure designed to unify Government Subsidies, Commercial Banks, and millions of Citizens.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-6 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-blue-600/20">
                Request Executive Demo
              </button>
              <button className="px-12 py-6 bg-white border-2 border-slate-100 hover:border-blue-600 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                Download Whitepaper
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution (Light Grid) */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* The Current State */}
            <div className="p-16 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl shadow-blue-900/5">
              <h3 className="text-rose-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-3">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" /> The Bottleneck
              </h3>
              <h4 className="text-4xl font-black mb-10 text-slate-900">Legacy Paper Systems</h4>
              <ul className="space-y-8">
                {[
                  "6-Month average processing delays",
                  "Fragmented identity verification silos",
                  "Vulnerability to subsidy leakages",
                  "Zero visibility for financial institutions"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-5 text-slate-500 font-medium">
                    <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 text-rose-500">
                       <Zap size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* The HomeBuyer Solution */}
            <div className="p-16 bg-blue-600 rounded-[3.5rem] text-white shadow-[0_50px_100px_-20px_rgba(37,99,235,0.3)] relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-blue-200 font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-200 rounded-full" /> The Innovation
                </h3>
                <h4 className="text-4xl font-black mb-10">HomeBuyer Infrastructure</h4>
                <ul className="space-y-8">
                  {[
                    "48-Hour digital approval pipeline",
                    "Unified Cryptographic Identity Hub",
                    "Live Digital Audit Trail for Authorities",
                    "Open Banking API for Mortgage Leads"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-5 text-blue-50 font-medium">
                      <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                         <CheckCircle2 size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <ShieldCheck className="absolute bottom-[-30px] right-[-30px] text-white/5 group-hover:scale-110 transition-transform" size={250} />
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Models (Clean Cards) */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6 block">Profitability</span>
             <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-8">Value Engineering.</h2>
             <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">Sustainable monetization designed for the next decade of housing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                t: "Lead Generation", 
                d: "Premium verified leads for commercial banks looking for high-quality mortgage growth.",
                icon: Building2,
                color: "bg-blue-50 text-blue-600"
              },
              { 
                t: "SaaS Licensing", 
                d: "Cloud-based management for Municipalities to track local housing throughput.",
                icon: Globe,
                color: "bg-emerald-50 text-emerald-600"
              },
              { 
                t: "Security Audits", 
                d: "Digital signature and document verification fees for sovereign-grade data integrity.",
                icon: Lock,
                color: "bg-indigo-50 text-indigo-600"
              }
            ].map((box, i) => (
              <div key={i} className="p-12 bg-[#fafbfc] border border-slate-100 rounded-[3rem] group hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                <div className={`w-20 h-20 ${box.color} rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-[15deg] transition-transform`}>
                   <box.icon size={36} />
                </div>
                <h4 className="text-2xl font-black mb-4 text-slate-900">{box.t}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{box.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA (Light Blue) */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[5rem] p-24 lg:p-40 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3b82f633,transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.9]">
                Partner for <br />the Future.
              </h2>
              <p className="text-xl lg:text-3xl text-slate-400 mb-20 max-w-2xl mx-auto font-medium">
                Join our strategic consortium to scale this across 753 Municipalities.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <button className="px-14 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-600/20">
                  Contact Strategy Division
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center bg-white border-t border-slate-50">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">HomeBuyer Portal © 2026 | Private Partnership Protocol</p>
      </footer>
    </div>
  );
};

export default BusinessProposal;
