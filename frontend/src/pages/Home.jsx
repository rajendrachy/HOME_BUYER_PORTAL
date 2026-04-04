import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, ArrowRight, Globe, ChevronDown, CheckCircle2, 
  Menu, X, Mail, Phone, MapPin
} from "lucide-react";
import { TRANSLATIONS } from "../data/translations";

// --- Custom Social Icons (SVGs) to ensure build stability ---
const SocialIcon = ({ d, label }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="18" 
    height="18" 
    className="hover:text-blue-600 transition-colors cursor-pointer" 
    aria-label={label}
  >
    <path d={d} />
  </svg>
);

const FB_PATH = "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z";
const TW_PATH = "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z";
const LN_PATH = "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z";
const IG_PATH = "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z";

// --- Sub-components ---

const FeatureCard = ({ title, desc, icon: Icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const GuideExplorer = ({ guides, language }) => {
  const [activeTab, setActiveTab] = useState("citizen");
  const current = guides[activeTab];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        {["citizen", "bank", "municipality"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {guides[tab].title}
          </button>
        ))}
      </div>
      <div className="p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-3xl font-black text-gray-900 mb-4">{current.title}</h3>
            <p className="text-gray-500 mb-10 text-lg">{current.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {current.steps.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const LoanIntelligence = ({ sections }) => {
  const [openId, setOpenId] = useState("eligibility");

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-3xl border border-gray-100 overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
          <button
            onClick={() => setOpenId(openId === section.id ? null : section.id)}
            className={`w-full p-6 flex items-center justify-between text-left transition-colors ${
              openId === section.id ? "bg-blue-600 text-white" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <section.icon size={24} className={openId === section.id ? "text-blue-100" : "text-blue-600"} />
              <span className="font-bold text-lg">{section.title}</span>
            </div>
            <ChevronDown className={`transition-transform duration-300 ${openId === section.id ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openId === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-4">
                  {section.content.map((item, i) => (
                    <div key={i} className="flex gap-3 text-gray-600">
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// --- Main Component ---

export default function Home() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [scrolled, setScrolled] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">HomeBuyer<span className="text-blue-600">.</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {["features", "guides", "stats"].map(key => (
              <a href={`#${key}`} key={key} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
                {t.nav[key]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
               onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all group"
            >
               <Globe size={14} className="text-gray-400 group-hover:text-blue-600" />
               <span className="text-[10px] font-black uppercase tracking-widest">
                  {language === 'en' ? 'नेपाली' : 'English'}
               </span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />
            <button onClick={() => navigate("/login")} className="text-sm font-bold hover:text-blue-600 transition-colors px-2">
              {t.nav.login}
            </button>
            <button 
                onClick={() => navigate("/register")} 
                className="hidden sm:block bg-blue-600 text-white px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all"
            >
              {t.nav.register}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">
              {t.hero.tag}
            </span>
            <h1 className="text-5xl lg:text-8xl font-black text-gray-900 mb-8 leading-[1.05] tracking-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
               <button 
                  onClick={() => navigate("/register")} 
                  className="bg-blue-600 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
               >
                  {t.hero.primaryCTA} <ArrowRight size={20} />
               </button>
               <button 
                  onClick={() => navigate("/track")} 
                  className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all"
               >
                  {t.hero.secondaryCTA}
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.stats.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="p-10 bg-white rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all"
                >
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Building2 size={64} />
                   </div>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">{s.label}</p>
                   <h3 className="text-4xl font-black text-gray-900 mb-2">{s.value}</h3>
                   <p className="text-gray-400 text-xs font-medium">{s.sub}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
           <div className="max-w-3xl mb-20 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                 {t.features.title}
              </h2>
              <p className="text-xl text-gray-400 font-medium">{t.features.subtitle}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {t.features.items.map((f, i) => (
                <FeatureCard key={i} {...f} index={i} />
              ))}
           </div>
        </div>
      </section>

      {/* Step-by-Step Guides (Explorer) */}
      <section id="guides" className="py-32 bg-gray-900 rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
                 {t.guides.title}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">{t.guides.subtitle}</p>
           </div>
           <GuideExplorer guides={t.guides} language={language} />
        </div>
      </section>

      {/* Loan & Subsidy Intelligence */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div>
                 <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-10 leading-[1.1] tracking-tight">
                    {t.loanDetails.title}
                 </h2>
                 <p className="text-xl text-gray-500 mb-12 font-medium leading-relaxed">
                    Everything you need to know about the fine print of government grants and inclusive banking.
                 </p>
                 <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                    <div className="flex items-center gap-4 mb-4">
                       <CheckCircle2 size={32} className="text-blue-600" />
                       <h4 className="text-xl font-black text-blue-900">Total Transparency</h4>
                    </div>
                    <p className="text-blue-600/70 text-sm font-medium leading-relaxed">
                       Our smart contracts ensure that once your application is approved, your subsidy remains locked and guaranteed for the full building cycle.
                    </p>
                 </div>
              </div>
              <LoanIntelligence sections={t.loanDetails.sections} />
           </div>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
           <h2 className="text-4xl font-black text-gray-900 mb-16 text-center">Frequently Asked Questions</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {t.faqs.map((f, i) => (
                <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
                   <h4 className="text-lg font-black text-gray-900 mb-4 flex items-start gap-4">
                      <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xs">Q</span>
                      {f.q}
                   </h4>
                   <p className="text-gray-500 text-sm leading-relaxed pl-12">{f.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Global CTA */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
           <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
           
           <div className="relative z-10">
              <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
                 {t.cta.title}
              </h2>
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium">
                 {t.cta.subtitle}
              </p>
              <button 
                 onClick={() => navigate("/register")}
                 className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                 {t.cta.button}
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
              <div className="max-w-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                       <Building2 size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">HomeBuyer.</span>
                 </div>
                 <p className="text-gray-400 font-medium leading-relaxed">
                    {t.footer.desc}
                 </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Portal</h4>
                    <ul className="space-y-3">
                       {["Home", "Apply", "Track"].map(l => (
                          <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-blue-600 transition-colors">{l}</a></li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Information</h4>
                    <ul className="space-y-3">
                       {["Eligibility", "Documents", "Timeline"].map(l => (
                          <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-blue-600 transition-colors">{l}</a></li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Legal</h4>
                    <ul className="space-y-3">
                       {["Privacy", "Terms", "Support"].map(l => (
                          <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-blue-600 transition-colors">{l}</a></li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
           
           <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-xs font-medium">{t.footer.rights}</p>
              <div className="flex items-center gap-6 text-gray-400">
                 <SocialIcon d={FB_PATH} label="Facebook" />
                 <SocialIcon d={TW_PATH} label="Twitter" />
                 <SocialIcon d={LN_PATH} label="LinkedIn" />
                 <SocialIcon d={IG_PATH} label="Instagram" />
              </div>
           </div>
        </div>
      </footer>

      {/* Global Aesthetics Helper */}
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        .btn-premium {
           background: linear-gradient(135deg, #2563eb, #1d4ed8);
           color: white;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-premium:hover {
           box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.5);
           transform: translateY(-2px);
        }
      `}} />
    </div>
  );
}
