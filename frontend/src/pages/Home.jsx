import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
   Building2, ArrowRight, Globe, ChevronDown, CheckCircle2,
   Menu, X, Mail, Phone, MapPin, Sparkles, ShieldCheck, Zap,
   TrendingUp, Users, Award, ExternalLink
} from "lucide-react";
import { TRANSLATIONS } from "../data/translations";

// --- Sub-components ---

const FeatureCard = ({ title, desc, icon: Icon, index }) => (
   <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 shadow-[0_10px_50px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_70px_-15px_rgba(37,99,235,0.15)] transition-all duration-500 group overflow-hidden"
   >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-600 transition-colors duration-500 opacity-20 group-hover:opacity-100" />
      <div className="relative z-10">
         <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:rotate-[10deg] transition-transform duration-300">
            <Icon size={32} />
         </div>
         <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{title}</h3>
         <p className="text-slate-600 leading-relaxed font-medium">{desc}</p>
      </div>
   </motion.div>
);

const PartnerLogo = ({ name }) => (
   <div className="flex items-center justify-center px-10 py-4 group cursor-pointer transition-all duration-500">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-200 group-hover:border-blue-500">
            <Building2 size={20} className="opacity-40 group-hover:opacity-100" />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-600 transition-colors">Official Partner</span>
            <span className="text-sm font-black text-slate-800 tracking-tight">{name}</span>
         </div>
      </div>
   </div>
);

const Home = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const [language, setLanguage] = useState("en");
   const [scrolled, setScrolled] = useState(false);
   const containerRef = useRef(null);
   const t = TRANSLATIONS[language];

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

   const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end start"]
   });

   const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
   const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

   useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   return (
      <div ref={containerRef} className="min-h-screen bg-[#fafbfc] selection:bg-blue-600 selection:text-white">

         {/* Navigation */}
         <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-4" : "bg-transparent py-8"
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
               <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:bg-blue-600 transition-colors duration-300">
                     <Building2 size={28} />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-slate-900">
                     HomeBuyer<span className="text-blue-600">.</span>
                  </span>
               </div>

               <div className="hidden lg:flex items-center gap-10">
                  {["features", "guides", "stats", "business", "budget", "analytics"].map(key => (
                     <a 
                       href={key === 'business' ? '/business' : key === 'budget' ? '/budget' : key === 'analytics' ? '/intelligence' : `#${key}`} 
                       key={key} 
                       className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-blue-600 transition-all"
                     >
                        {key === 'business' ? 'Business' : key === 'budget' ? 'Budget' : key === 'analytics' ? 'Analytics' : t.nav[key]}
                     </a>
                  ))}
                  {user && (
                     <Link to={getDashboardLink()} className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 hover:text-blue-700 transition-all">
                        Dashboard
                     </Link>
                  )}
               </div>

               <div className="flex items-center gap-6">
                  <button
                     onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                     className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:border-blue-600 transition-all group"
                  >
                     <Globe size={14} className="text-slate-400 group-hover:text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                        {language === 'en' ? 'नेपाली' : 'English'}
                     </span>
                  </button>
                  {user ? (
                     <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 hidden sm:block">{user?.name?.split(' ')[0] || 'User'}</span>
                        <button onClick={() => navigate(getDashboardLink())} className="btn-premium py-4">
                           Go to Dashboard
                        </button>
                     </div>
                  ) : (
                     <>
                        <button onClick={() => navigate("/login")} className="text-sm font-black text-slate-900 hover:text-blue-600 transition-all px-2 hidden sm:block">
                           {t.nav.login}
                        </button>
                        <button
                           onClick={() => navigate("/register")}
                           className="btn-premium py-4"
                        >
                           {t.nav.register}
                        </button>
                     </>
                  )}
               </div>
            </div>
         </nav>

         {/* Hero Section */}
         <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">

               {/* Left Content */}
               <div className="lg:col-span-7 relative z-20">
                  <motion.div
                     initial={{ opacity: 0, x: -30 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                     <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full mb-10 shadow-sm border border-blue-100">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                           {t.hero.tag}
                        </span>
                     </div>
                     <h1 className="text-6xl lg:text-[7.5rem] font-black text-slate-900 mb-10 leading-[0.9] tracking-tighter">
                        Your Dream <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-shine">Home Portal.</span>
                     </h1>
                     <p className="text-xl lg:text-2xl text-slate-600 mb-14 leading-relaxed font-medium max-w-xl">
                        {t.hero.subtitle}
                     </p>
                     <div className="flex flex-col sm:flex-row gap-6">
                        <button
                           onClick={() => navigate(user ? getDashboardLink() : "/register")}
                           className="btn-premium group"
                        >
                           {user ? 'Return to Dashboard' : 'Get Started Now'}
                           <ArrowRight size={22} className="inline ml-3 group-hover:translate-x-2 transition-transform" />
                        </button>
                        {!user && (
                           <button
                              onClick={() => navigate("/track")}
                              className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-sm"
                           >
                              {t.hero.secondaryCTA}
                           </button>
                        )}
                     </div>
                  </motion.div>
               </div>

               {/* Right Image (Contained) */}
               <div className="lg:col-span-5 relative mt-12 lg:mt-0">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                     animate={{ opacity: 1, scale: 1, rotate: 0 }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="relative z-10 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] aspect-[4/5] md:h-[700px] md:aspect-auto border-4 md:border-[12px] border-white"
                  >
                     <img
                        src="/images/hero-bg.png"
                        alt="Luxury Architecture"
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div
                     animate={{ y: [0, -20, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute -bottom-10 -left-10 z-20 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center gap-5"
                  >
                     <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                        <ShieldCheck size={32} />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-slate-900 leading-none mb-1">99.9% Secure</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Government Verified</p>
                     </div>
                  </motion.div>
               </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-50" />
         </section>

         {/* Trusted Partners */}
         <section className="py-12 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-wrap justify-center items-center gap-y-8 divide-x divide-slate-100">
                  {["Government of Nepal", "Global Bank", "NIC Asia", "Nabil Bank", "Civil Bank"].map(p => (
                     <PartnerLogo key={p} name={p} />
                  ))}
               </div>
            </div>
         </section>

         {/* Stats Dashboard Style */}
         <section id="stats" className="py-32 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {t.stats.map((s, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] group hover:border-blue-500/50 transition-all duration-500"
                     >
                        <TrendingUp size={24} className="text-blue-400 mb-6 group-hover:scale-125 transition-transform" />
                        <h3 className="text-5xl font-black text-white mb-2">{s.value}</h3>
                        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4">{s.label}</p>
                        <p className="text-slate-400 text-sm font-medium">{s.sub}</p>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* Why Choose Us */}
         <section id="features" className="py-40">
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-24">
                  <div className="max-w-2xl">
                     <span className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-6 block">Our Value Proposition</span>
                     <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                        {t.features.title}
                     </h2>
                  </div>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-sm">
                     {t.features.subtitle}
                  </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {t.features.items.map((f, i) => (
                     <FeatureCard key={i} {...f} index={i} />
                  ))}
               </div>
            </div>
         </section>

         {/* Feature Highlight: The Dashboard */}
         <section className="py-40 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
               <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div className="relative">
                     <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]"
                     >
                        <img src="/images/family.png" alt="Happy Home" className="w-full h-[600px] object-cover" />
                     </motion.div>
                     <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600 rounded-[3rem] flex flex-col items-center justify-center text-white p-10 shadow-2xl z-20 animate-float">
                        <Award size={48} className="mb-4" />
                        <h4 className="text-4xl font-black mb-1">#1</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Top Rated Government Portal</p>
                     </div>
                  </div>
                  <div>
                     <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-10 leading-[1.1]">
                        Modern Living <br />Simplified for You.
                     </h2>
                     <div className="space-y-8">
                        {[
                           { t: "Fast Approval", d: "Experience the fastest processing times in the industry with our direct-to-bank API integration." },
                           { t: "Secure Data", d: "Your documents are protected with government-grade encryption and biometric verification." },
                           { t: "Full Transparency", d: "Track your application status in real-time with automatic SMS and email updates." }
                        ].map((item, i) => (
                           <div key={i} className="flex gap-6 group">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <CheckCircle2 size={24} />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-slate-900 mb-2">{item.t}</h4>
                                 <p className="text-slate-600 text-sm font-medium leading-relaxed">{item.d}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* The Journey Section */}
         <section id="guides" className="py-40 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-24">
                  <span className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-6 block">The Journey</span>
                  <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                     Three Steps to Your <br />New Front Door.
                  </h2>
               </div>
               <div className="grid md:grid-cols-3 gap-12 relative">
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0" />
                  {[
                     { t: "Apply Online", d: "Fill out our smart form in under 10 minutes. No paperwork required.", icon: Sparkles },
                     { t: "Get Approved", d: "Receive your subsidy and bank offers within 48 hours of submission.", icon: ShieldCheck },
                     { t: "Move In", d: "Finalize your mortgage and start building your future home.", icon: Building2 }
                  ].map((step, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center group hover:border-blue-600 transition-all duration-500"
                     >
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600 transition-colors duration-500 group-hover:rotate-[15deg]">
                           <step.icon size={36} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-4">{step.t}</h4>
                        <p className="text-slate-600 font-medium leading-relaxed">{step.d}</p>
                        <div className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                           Step {i + 1}
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         {/* Success Stories */}
         <section className="py-40 bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div>
                     <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
                        Trusted by the <br />Next Generation.
                     </h2>
                     <div className="flex gap-4 mb-12">
                        {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} size={20} className="text-blue-400 fill-blue-400" />)}
                     </div>
                     <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">
                        "The portal made our first home purchase incredibly smooth. From subsidy application to loan approval, everything was transparent and fast. Highly recommended for any young family in Nepal."
                     </p>
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                           A
                        </div>
                        <div>
                           <h4 className="text-white font-black text-xl">Arjun K.</h4>
                           <p className="text-slate-500 font-black text-xs uppercase tracking-widest">First-time Homeowner, Kathmandu</p>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     {[
                        { v: "98%", l: "Satisfaction Rate" },
                        { v: "2.4k", l: "Loans Approved" },
                        { v: "15m", l: "Subsidies Disbursed" },
                        { v: "48h", l: "Avg. Response Time" }
                     ].map((stat, i) => (
                        <div key={i} className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-colors">
                           <h3 className="text-4xl font-black text-white mb-2">{stat.v}</h3>
                           <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{stat.l}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* Final CTA */}
         <section className="py-40 px-6">
            <div className="max-w-7xl mx-auto bg-slate-900 rounded-[5rem] p-20 lg:p-40 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3b82f644,transparent_70%)]" />
               <div className="relative z-10">
                  <h2 className="text-6xl lg:text-[8rem] font-black text-white mb-12 tracking-tighter leading-[0.9]">
                     Ready to <br />Move In?
                  </h2>
                  <p className="text-xl lg:text-3xl text-slate-400 mb-20 max-w-2xl mx-auto font-medium">
                     Join 10,000+ happy Nepali families who found their dream home through our portal.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                     <button onClick={() => navigate("/register")} className="btn-premium">
                        Create Account
                     </button>
                     <button onClick={() => navigate("/track")} className="px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] border-2 border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all duration-500">
                        Check Status
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* Expanded Footer */}
         <footer className="bg-white pt-40 pb-20 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
                  <div className="lg:col-span-4">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                           <Building2 size={32} />
                        </div>
                        <span className="text-3xl font-black tracking-tighter">HomeBuyer<span className="text-blue-600">.</span></span>
                     </div>
                     <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mb-10">
                        Transforming home ownership in Nepal through transparent, fast, and accessible digital subsidies.
                     </p>
                     <div className="flex gap-4">
                        <button className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                           <Globe size={20} />
                        </button>
                        <button className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                           <Mail size={20} />
                        </button>
                        <button className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                           <Phone size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
                     {[
                        { t: "Platform", l: ["Dashboard", "Application", "Track Status", "Bank Offers", "Subsidies"] },
                        { t: "Resources", l: ["User Guide", "Video Tutorials", "Documentation", "News & Updates", "Events"] },
                        { t: "Support", l: ["Help Center", "Live Chat", "Contact Us", "Technical Support", "Feedback"] },
                        { t: "Legal", l: ["Privacy Policy", "Terms of Use", "Cookie Policy", "Compliance", "Security"] }
                     ].map((section, i) => (
                        <div key={i} className="flex flex-col">
                           <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{section.t}</h4>
                           <ul className="space-y-4">
                              {section.l.map(link => (
                                 <li key={link}>
                                    <a href="#" className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-all flex items-center gap-2 group">
                                       <div className="w-1 h-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                       {link}
                                    </a>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-12 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="flex items-center gap-10">
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 Government of Nepal</p>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Managed by Ministry of Urban Development</p>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status: Operational</span>
                     </div>
                     <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 shadow-xl">
                        <ChevronDown size={24} className="rotate-180" />
                     </button>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Home;
