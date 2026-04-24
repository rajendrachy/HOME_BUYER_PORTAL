import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, ShieldCheck, Zap, Users, 
  ArrowRight, Building2, Globe, Lock, 
  Handshake, PieChart, Briefcase, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessProposal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050a14] text-white selection:bg-blue-600 selection:text-white font-sans">
      {/* Premium Dark Gradient Header */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] -mt-64" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
              <Briefcase size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Exclusive Partnership Proposal</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">
              Digitalizing Nepal's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Housing Economy.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-16">
              A sovereign-grade digital infrastructure designed to bridge the gap between Government Subsidies, Commercial Banks, and 30 million Citizens.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-blue-600/20">
                Request Executive Demo
              </button>
              <button className="px-12 py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all">
                Download Whitepaper
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem & Solution Grid */}
      <section className="py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* The Current State */}
            <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[3rem]">
              <h3 className="text-rose-400 font-black uppercase tracking-[0.3em] text-xs mb-8">The Bottleneck</h3>
              <h4 className="text-3xl font-black mb-10">Current Paper-Based Ecosystem</h4>
              <ul className="space-y-6">
                {[
                  "6-9 Months average processing time",
                  "Fragmented identity verification (KYC)",
                  "High risk of subsidy fraud and leakage",
                  "Low transparency for loan applicants"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-400 font-medium">
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* The HomeBuyer Solution */}
            <div className="p-12 bg-blue-600/5 border border-blue-500/20 rounded-[3rem]">
              <h3 className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs mb-8">The Innovation</h3>
              <h4 className="text-3xl font-black mb-10">HomeBuyer Infrastructure</h4>
              <ul className="space-y-6">
                {[
                  "48-Hour accelerated approval pipeline",
                  "Unified Cryptographic Identity Hub",
                  "Automated Audit Trail for Authorities",
                  "Direct API Integration for Banks"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-blue-100 font-medium">
                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue & Value Models */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8">Revenue & Value.</h2>
             <p className="text-slate-500 max-w-2xl mx-auto font-medium">Multiple monetization streams designed for sustainable public-private partnerships.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                t: "Bank Lead Gen", 
                d: "Monetize pre-verified, government-approved leads for commercial banks.",
                icon: Building2,
                color: "text-blue-400"
              },
              { 
                t: "SaaS Licensing", 
                d: "Municipalities pay a monthly subscription to manage their local residents.",
                icon: Globe,
                color: "text-indigo-400"
              },
              { 
                t: "Verification Fees", 
                d: "Transaction-based fees for cryptographic document verification.",
                icon: ShieldCheck,
                color: "text-emerald-400"
              }
            ].map((box, i) => (
              <div key={i} className="p-12 bg-white/[0.03] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.06] transition-all">
                <box.icon size={40} className={`${box.color} mb-8 group-hover:scale-110 transition-transform`} />
                <h4 className="text-2xl font-black mb-4">{box.t}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{box.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Trust (The "Why We Are Better") */}
      <section className="py-40 bg-[#0a0f1d]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-blue-400 font-black text-xs uppercase tracking-[0.4em] mb-6 block">Unrivaled Security</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter mb-10">Built for National <br />Security.</h2>
            <div className="space-y-10">
              {[
                { t: "Multi-Factor Biometrics", d: "Time-based OTP and biometric-ready identity verification." },
                { t: "Document Encryption", d: "Cloudinary-hosted documents with unique authority access keys." },
                { t: "Immutable Logs", d: "Every status change is logged with the officer's digital signature." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h5 className="text-xl font-black mb-2">{item.t}</h5>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-blue-600/20 rounded-[4rem] blur-[100px] absolute inset-0 animate-pulse" />
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl">
              <PieChart size={300} className="mx-auto text-blue-500/50" />
              <div className="mt-12 space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Efficiency</span>
                  <span className="text-xl font-black text-emerald-400">+400%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Operational Risk Reduction</span>
                  <span className="text-xl font-black text-blue-400">-92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40">
        <div className="max-w-5xl mx-auto px-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[5rem] p-20 lg:p-32 text-center shadow-[0_50px_100px_-20px_rgba(37,99,235,0.4)]">
          <h2 className="text-5xl lg:text-7xl font-black mb-10 leading-[0.9] tracking-tighter">
            Let’s Scale <br />The Future.
          </h2>
          <p className="text-xl text-blue-100 mb-16 max-w-xl mx-auto font-medium">
            Contact our strategic partnership division to discuss acquisition or licensing opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-14 py-6 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-900 hover:text-white transition-all">
              Contact Strategy Team
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-white/5">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">HomeBuyer Portal © 2026 | Confidential Executive Proposal</p>
      </footer>
    </div>
  );
};

export default BusinessProposal;
