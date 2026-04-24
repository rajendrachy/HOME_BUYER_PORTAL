import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Github, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 font-sans relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
           
           {/* Brand Section */}
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <ShieldCheck size={22} />
                 </div>
                 <span className="text-2xl font-black tracking-tighter">HomeBuyer.</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                 The official national gateway for residential home subsidies and mortgage integration. Secured by government-grade encryption.
              </p>
              <div className="flex gap-4">
                 {[Twitter, Facebook, Github].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                       <Icon size={18} />
                    </a>
                 ))}
              </div>
           </div>

           {/* Quick Links */}
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Navigation</h4>
              <ul className="space-y-4">
                 {[
                   { l: 'Market Analytics', p: '/' },
                   { l: 'Tracking Ledger', p: '/track' },
                   { l: 'Business & Partners', p: '/business' },
                   { l: 'Eligibility Criteria', p: '#' },
                   { l: 'Partner Banks', p: '#' }
                 ].map((link, i) => (
                    <li key={i}>
                       <Link to={link.p} className="text-slate-400 hover:text-blue-400 text-sm font-bold transition-colors flex items-center gap-2 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors" />
                          {link.l}
                       </Link>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Legal & Compliance */}
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Compliance</h4>
              <ul className="space-y-4">
                 {[
                   'Privacy Protocol',
                   'Service Agreement',
                   'Cookie Policy',
                   'API Documentation',
                   'Government Mandate'
                 ].map((link, i) => (
                    <li key={i}>
                       <a href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-between group">
                          {link}
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                       </a>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Contact Support */}
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Direct Channel</h4>
              <ul className="space-y-6">
                 <li className="flex gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                       <Mail size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Official Email</p>
                       <a href="mailto:support@homebuyer.gov.np" className="text-sm font-bold hover:text-blue-400 transition-colors">support@homebuyer.gov.np</a>
                    </div>
                 </li>
                 <li className="flex gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                       <Phone size={18} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Assistance Line</p>
                       <p className="text-sm font-bold">+977 (01) 4523-990</p>
                    </div>
                 </li>
              </ul>
           </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 HomeBuyer Portal. Government of Nepal. All Rights Reserved.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mainframe Status: Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">v2.4.1 Production</span>
              </div>
           </div>
        </div>

      </div>

      {/* Aesthetic Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] -ml-32 -mb-32" />
    </footer>
  );
};

export default Footer;
