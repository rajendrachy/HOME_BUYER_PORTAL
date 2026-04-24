import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, PieChart as PieChartIcon, TrendingDown, 
  Building2, Wallet, Calendar, ArrowRight, Info,
  Sparkles, ShieldCheck, Download
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const BudgetPlanner = () => {
  // Financial State
  const [propertyCost, setPropertyCost] = useState(5000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(15);
  const [subsidyAmount, setSubsidyAmount] = useState(300000);

  // Derived Values
  const [loanAmount, setLoanAmount] = useState(0);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    const principal = propertyCost - downPayment - subsidyAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const months = tenure * 12;
    
    const emiCalc = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / (Math.pow(1 + ratePerMonth, months) - 1);
    
    setLoanAmount(principal);
    setEmi(emiCalc);
    setTotalPayment(emiCalc * months);
    setTotalInterest((emiCalc * months) - principal);
  }, [propertyCost, downPayment, interestRate, tenure, subsidyAmount]);

  const chartData = [
    { name: 'Principal', value: loanAmount, color: '#2563eb' },
    { name: 'Total Interest', value: totalInterest, color: '#f59e0b' },
    { name: 'Down Payment', value: downPayment, color: '#10b981' },
    { name: 'Subsidy', value: subsidyAmount, color: '#8b5cf6' }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-full mb-8 border border-blue-50 shadow-sm"
            >
              <Calculator size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Financial Advisory Engine v2.0</span>
            </motion.div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
              Mortgage <br /><span className="text-blue-600">Intelligence.</span>
            </h1>
          </div>
          <p className="text-xl text-slate-500 font-medium max-w-sm leading-relaxed">
            Professional-grade budget simulations powered by current Nepalese banking protocols.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-blue-900/5">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Loan Parameters</h3>
              
              <div className="space-y-10">
                {/* Project Cost */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Project Cost (NPR)</label>
                    <span className="text-lg font-black text-blue-600">{propertyCost.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="1000000" max="50000000" step="100000"
                    value={propertyCost} onChange={(e) => setPropertyCost(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Down Payment */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Your Savings (NPR)</label>
                    <span className="text-lg font-black text-emerald-600">{downPayment.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100000" max={propertyCost * 0.9} step="50000"
                    value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Interest Rate (%)</label>
                    <span className="text-lg font-black text-amber-500">{interestRate}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="18" step="0.1"
                    value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Tenure (Years)</label>
                    <span className="text-lg font-black text-slate-900">{tenure} Yrs</span>
                  </div>
                  <input 
                    type="range" min="1" max="30" step="1"
                    value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Subsidy Highlight Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <Sparkles size={32} className="text-blue-200 mb-6" />
                  <h4 className="text-xl font-black mb-4">Government Subsidy Applied</h4>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed mb-8">
                    Your current profile qualifies for an estimated NPR 300,000 grant, reducing your long-term interest significantly.
                  </p>
                  <div className="text-3xl font-black">NPR {subsidyAmount.toLocaleString()}</div>
               </div>
               <ShieldCheck className="absolute bottom-[-20px] right-[-20px] text-white/10 group-hover:scale-110 transition-transform" size={180} />
            </div>
          </div>

          {/* Results & Visualization Panel */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Monthly EMI</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-slate-400">NPR</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(emi).toLocaleString()}</span>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Total Interest</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-slate-400">NPR</span>
                    <span className="text-4xl font-black text-amber-500 tracking-tighter">{Math.round(totalInterest).toLocaleString()}</span>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Loan Principal</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-slate-400">NPR</span>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter">{loanAmount.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl shadow-blue-900/5">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Capital Breakdown</h3>
                  <div className="flex gap-4">
                     <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-slate-900 transition-colors">
                        <Download size={14} /> Export Projection
                     </button>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(value) => `NPR ${value.toLocaleString()}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-6">
                     {chartData.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-4">
                             <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                             <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                             {((item.value / (totalPayment + downPayment)) * 100).toFixed(1)}%
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Call to Action for Banks */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row justify-between items-center gap-10">
               <div>
                  <h4 className="text-3xl font-black mb-4">Satisfied with these numbers?</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">Submit your dossier to our partner banks to get customized interest rates based on your profile.</p>
               </div>
               <button className="px-12 py-6 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shrink-0">
                  Request Official Bank Quote <ArrowRight size={18} />
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
