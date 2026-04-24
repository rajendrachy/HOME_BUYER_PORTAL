import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Map as MapIcon, TrendingUp, Users, Activity, 
  Globe, ShieldCheck, Zap, AlertCircle,
  BarChart3, Layers, Filter, Download,
  MapPin, Clock, Lock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Mock Geospatial Data for Nepal
const NEPAL_HOTSPOTS = [
  { id: 1, name: "Kathmandu", lat: 27.7172, lng: 85.3240, applications: 4520, growth: "+12%" },
  { id: 2, name: "Pokhara", lat: 28.2095, lng: 83.9856, applications: 2840, growth: "+8%" },
  { id: 3, name: "Lalitpur", lat: 27.6744, lng: 85.3240, applications: 3100, growth: "+15%" },
  { id: 4, name: "Biratnagar", lat: 26.4525, lng: 87.2717, applications: 1250, growth: "-2%" },
  { id: 5, name: "Bharatpur", lat: 27.6833, lng: 84.4333, applications: 1800, growth: "+22%" },
];

const PREDICTIVE_DATA = [
  { month: 'Jan', current: 400, predicted: 420 },
  { month: 'Feb', current: 600, predicted: 650 },
  { month: 'Mar', current: 800, predicted: 900 },
  { month: 'Apr', current: 1100, predicted: 1300 },
  { month: 'May', current: 1400, predicted: 1800 },
  { month: 'Jun', current: 1900, predicted: 2500 },
];

const IntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('geospatial');

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pt-32 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-full mb-8 border border-blue-50 shadow-sm"
            >
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">National Intelligence Dashboard</span>
            </motion.div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Sovereign <br /><span className="text-blue-600">Analytics.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             {['geospatial', 'predictive', 'audit'].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Main Visualizer Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Map Container */}
            <div className="relative bg-white border border-slate-100 rounded-[4rem] overflow-hidden h-[700px] shadow-2xl shadow-blue-900/5">
               <div className="absolute top-10 left-10 z-[1000] flex gap-4">
                  <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-xl">
                     <MapIcon size={16} className="text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Nepal Heatmap Layer</span>
                  </div>
               </div>
               
               <MapContainer 
                 center={[28.3949, 84.1240]} 
                 zoom={7} 
                 className="h-full w-full"
                 zoomControl={false}
                 style={{ height: '100%', width: '100%' }}
               >
                 <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                 {NEPAL_HOTSPOTS.map(spot => (
                   <Circle 
                     key={spot.id}
                     center={[spot.lat, spot.lng]}
                     radius={spot.applications * 15}
                     pathOptions={{ 
                       fillColor: '#2563eb', 
                       color: '#3b82f6', 
                       weight: 2, 
                       fillOpacity: 0.3 
                     }}
                   >
                     <Popup>
                       <div className="p-4 font-sans">
                         <h4 className="font-black text-slate-900 mb-1 text-lg">{spot.name}</h4>
                         <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-widest">{spot.applications} Active Applications</p>
                         <div className="flex items-center gap-2 text-blue-600 font-black text-xs">
                            <TrendingUp size={14} /> {spot.growth} Projection
                         </div>
                       </div>
                     </Popup>
                   </Circle>
                 ))}
               </MapContainer>

               <div className="absolute bottom-10 right-10 z-[1000]">
                  <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Disbursement</h4>
                     <div className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">NPR 1.28B</div>
                     <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <TrendingUp size={12} /> Live velocity
                     </div>
                  </div>
               </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white border border-slate-100 rounded-[4rem] p-12 shadow-xl shadow-blue-900/5">
               <div className="flex justify-between items-center mb-12">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight">Predictive Growth</h3>
                     <p className="text-slate-500 text-sm font-medium">Fiscal demand projections for the next quarter</p>
                  </div>
                  <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-inner">
                     <Download size={20} />
                  </button>
               </div>
               
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={PREDICTIVE_DATA}>
                        <defs>
                           <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="predicted" stroke="#2563eb" fillOpacity={1} fill="url(#colorPredicted)" strokeWidth={4} />
                        <Area type="monotone" dataKey="current" stroke="#cbd5e1" fill="transparent" strokeDasharray="8 8" strokeWidth={2} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Activity Stream Area */}
          <div className="lg:col-span-4 space-y-10">
             
             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-6">
                {[
                  { l: 'Cities', v: '142', i: Globe, c: 'bg-blue-50 text-blue-600' },
                  { l: 'Users', v: '24.8k', i: Users, c: 'bg-emerald-50 text-emerald-600' },
                  { l: 'Security', v: '99.9%', i: ShieldCheck, c: 'bg-indigo-50 text-indigo-600' },
                  { l: 'System', v: 'Active', i: Zap, c: 'bg-amber-50 text-amber-600' },
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-lg shadow-blue-900/5 hover:bg-slate-50 transition-all">
                     <div className={`w-12 h-12 ${stat.c} rounded-2xl flex items-center justify-center mb-6`}>
                        <stat.i size={20} />
                     </div>
                     <div className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{stat.v}</div>
                     <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.l}</div>
                  </div>
                ))}
             </div>

             {/* Live Activity */}
             <div className="bg-white border border-slate-100 rounded-[4rem] p-10 shadow-2xl shadow-blue-900/5 h-[550px] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Live Pulse</h3>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Syncing...</span>
                   </div>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                   {[
                     { user: "Kathmandu Officer", action: "Approved Application #8492", time: "2m ago", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
                     { user: "Global Bank", action: "Submitted Mortgage Offer", time: "12m ago", icon: Zap, color: "text-blue-600 bg-blue-50" },
                     { user: "Pokhara Node", action: "New Application Inbound", time: "24m ago", icon: Activity, color: "text-amber-600 bg-amber-50" },
                     { user: "Ministry Auditor", action: "Document Verified", time: "1h ago", icon: Lock, color: "text-indigo-600 bg-indigo-50" },
                     { user: "System", action: "Database Optimization", time: "2h ago", icon: Globe, color: "text-slate-600 bg-slate-50" },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 p-6 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} shrink-0 shadow-sm`}>
                           <item.icon size={20} />
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.user}</h5>
                              <span className="text-[9px] font-bold text-slate-400">{item.time}</span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium leading-tight">{item.action}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <button className="w-full py-6 mt-10 bg-slate-900 text-white rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                   View Full Infrastructure Logs
                </button>
             </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default IntelligenceDashboard;
