import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitApplication, getAllMunicipalities } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, Wallet, FileUp, 
  ChevronRight, ChevronLeft, CheckCircle2, 
  ShieldCheck, AlertCircle, Sparkles, Home,
  Phone, Mail, MapPin, Landmark,
  Eye, X
} from 'lucide-react';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateCitizenship = (num) => num.length >= 5 && num.length <= 20;

const SubmitApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    fullName: '', citizenshipNumber: '', phone: '', email: '', currentAddress: '', permanentAddress: '',
    employmentType: 'private', monthlyIncome: '', employerName: '',
    district: '', municipality: '', ward: '', tole: '', propertyType: 'house', propertyCost: '',
    familyMembers: '', dependents: '', spouseName: '',
    subsidyRequested: ''
  });

  const [files, setFiles] = useState({
    citizenshipDocument: null,
    incomeProofDocument: null,
    propertyDocument: null
  });

  const [previewUrls, setPreviewUrls] = useState({
    citizenshipDocument: null,
    incomeProofDocument: null,
    propertyDocument: null
  });

  const [activePreview, setActivePreview] = useState(null);

  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    const fetchMuni = async () => {
      try {
        const { data } = await getAllMunicipalities();
        setMunicipalities(data.municipalities || []);
      } catch (err) {
        console.error('Failed to fetch municipalities');
      }
    };
    fetchMuni();
  }, []);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file format. Please upload JPG, PNG, WEBP, or PDF.');
        return;
      }

      setFiles(prev => ({ ...prev, [name]: file }));
      
      // Revoke old URL if exists
      if (previewUrls[name]) URL.revokeObjectURL(previewUrls[name]);
      
      // Create new URL
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [name]: url }));
    }
  };

  const validateStep = (currentStep) => {
    setError('');
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !validateEmail(formData.email) || !validatePhone(formData.phone)) {
        setError('Please complete all personal identity fields correctly.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.district || !formData.municipality || !formData.propertyCost || parseInt(formData.propertyCost) < 100000) {
        setError('Please provide valid property and income details, including your municipality.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => validateStep(step) && setStep(prev => prev + 1);
  const prevStep = () => { setError(''); setStep(prev => prev - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.citizenshipDocument || !files.incomeProofDocument || !files.propertyDocument) {
       setError('Official documentation is required for all categories.');
       return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('personalInfo', JSON.stringify({
        fullName: formData.fullName, citizenshipNumber: formData.citizenshipNumber, phone: formData.phone,
        email: formData.email, currentAddress: formData.currentAddress, permanentAddress: formData.permanentAddress
      }));
      formDataToSend.append('employment', JSON.stringify({
        type: formData.employmentType, monthlyIncome: parseInt(formData.monthlyIncome), employerName: formData.employerName
      }));
      formDataToSend.append('property', JSON.stringify({
        district: formData.district, municipality: formData.municipality, ward: parseInt(formData.ward),
        tole: formData.tole, type: formData.propertyType, cost: parseInt(formData.propertyCost)
      }));
      formDataToSend.append('family', JSON.stringify({
        members: parseInt(formData.familyMembers), dependents: parseInt(formData.dependents), spouseName: formData.spouseName
      }));
      formDataToSend.append('subsidyRequested', parseInt(formData.subsidyRequested) || parseInt(formData.propertyCost) * 0.1);
      
      formDataToSend.append('citizenshipDocument', files.citizenshipDocument);
      formDataToSend.append('incomeProofDocument', files.incomeProofDocument);
      formDataToSend.append('propertyDocument', files.propertyDocument);

      const { data } = await submitApplication(formDataToSend);
      toast.success(`Application Secured! ID: ${data.applicationId}`);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div>
         <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Identity Protocol.</h2>
         <p className="text-slate-500 font-medium text-lg leading-relaxed">Provide your official personal credentials as per your national citizenship record.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
           <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="Arjun Karki" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Citizenship Number</label>
           <input type="text" name="citizenshipNumber" value={formData.citizenshipNumber} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="XX-XX-XX-XXXX" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
           <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="98XXXXXXXX" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
           <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="arjun@example.com" />
        </div>
        <div className="md:col-span-2 space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Residential Address</label>
           <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="Baneshwor, Kathmandu" />
        </div>
      </div>
    </motion.div>
  );

  const renderStepTwo = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div>
         <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Employment & Assets</h2>
         <p className="text-slate-500 font-medium text-sm">We need to verify your financial standing for subsidy calculation.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Employment Category</label>
           <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none">
             <option value="government">Government Official</option><option value="private">Private Sector</option><option value="business">Business Owner</option>
             <option value="foreign_employment">Foreign Employment</option>
           </select>
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Net Income (NPR)</label>
           <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="50000" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target District</label>
           <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="Kathmandu" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Municipality</label>
           <select name="municipality" value={formData.municipality} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none">
             <option value="">Select Municipality</option>
             {municipalities.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
           </select>
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ward Number</label>
           <input type="number" name="ward" value={formData.ward} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="10" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tole (Street/Area)</label>
           <input type="text" name="tole" value={formData.tole} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="Baneshwor" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Type</label>
           <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none">
             <option value="house">House</option>
             <option value="land">Land</option>
             <option value="apartment">Apartment</option>
           </select>
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Property Cost (NPR)</label>
           <input type="number" name="propertyCost" value={formData.propertyCost} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="15000000" />
        </div>
      </div>
    </motion.div>
  );

  const renderStepThree = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div>
         <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Family Context.</h2>
         <p className="text-slate-500 font-medium text-lg leading-relaxed">Household information helps our algorithms prioritize your subsidy allocation.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Family Members</label>
           <input type="number" name="familyMembers" value={formData.familyMembers} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="4" />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Number of Dependents</label>
           <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900" placeholder="2" />
        </div>
        <div className="md:col-span-2 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
           <label className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4 block">Requested Subsidy Amount</label>
           <input type="number" name="subsidyRequested" value={formData.subsidyRequested} onChange={handleChange} className="w-full px-8 py-6 bg-white border border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-4xl text-blue-600 placeholder:text-blue-100" placeholder="0.00" />
           <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-4 ml-1">Leave blank for automatic calculation (typically 10% of property value)</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStepFour = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
      <div>
         <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Official Documentation</h2>
         <p className="text-slate-500 font-medium text-sm">Securely upload scanned copies of your official documents.</p>
      </div>
      <div className="space-y-6">
        {[
          { label: "Citizenship Certificate", name: "citizenshipDocument", icon: ShieldCheck },
          { label: "Income Verification (Taxes/Salary)", name: "incomeProofDocument", icon: Wallet },
          { label: "Property Ownership Documents", name: "propertyDocument", icon: Landmark }
        ].map((file, i) => (
           <div key={i} className="relative group">
              <input 
                type="file" 
                name={file.name} 
                onChange={handleFileChange} 
                accept=".jpg,.jpeg,.png,.pdf,.webp"
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
              />
              <div className={`p-8 bg-slate-50 border-2 border-dashed ${files[file.name] ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 group-hover:border-blue-200'} rounded-[2.5rem] transition-all flex items-center justify-between`}>
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${files[file.name] ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'} rounded-2xl flex items-center justify-center shadow-sm transition-colors`}>
                       {files[file.name] ? <CheckCircle2 size={28} /> : <file.icon size={28} />}
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900 mb-1">{file.label}</h4>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {files[file.name] ? files[file.name].name : 'Click or drag to upload (Max 5MB)'}
                       </p>
                    </div>
                 </div>
                 {files[file.name] && (
                    <button 
                       type="button"
                       onClick={(e) => {
                          e.stopPropagation();
                          setActivePreview({
                             url: previewUrls[file.name],
                             name: files[file.name].name,
                             type: files[file.name].type
                          });
                       }}
                       className="p-4 bg-white border border-slate-100 text-blue-600 rounded-2xl shadow-sm hover:border-blue-600 transition-all flex items-center gap-2 group/btn"
                    >
                       <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                    </button>
                 )}
                 {!files[file.name] && <FileUp className="text-slate-200 group-hover:text-blue-600 transition-colors" size={32} />}
              </div>
           </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-20">
        
        {/* Left Side: Progress Tracker */}
        <div className="lg:w-1/3">
           <div className="sticky top-32">
              <button 
                 onClick={() => navigate('/citizen/dashboard')} 
                 className="mb-12 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                 <ChevronLeft size={16} /> Back to Dashboard
              </button>
              
              <div className="space-y-8">
                 {[
                   { n: "01", t: "Personal Identity", d: "Verify citizenship and contact details", i: User },
                   { n: "02", t: "Financial Profile", d: "Employment and asset valuation", i: Building2 },
                   { n: "03", t: "Household Info", d: "Family members and subsidy requests", i: Home },
                   { n: "04", t: "Official Files", d: "Secure document uploading", i: FileUp }
                 ].map((s, i) => (
                    <div key={i} className="flex gap-6 items-center group">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-sm ${step > i + 1 ? 'bg-emerald-600 text-white' : step === i + 1 ? 'bg-blue-600 text-white scale-110 shadow-blue-600/20' : 'bg-white text-slate-300'}`}>
                          {step > i + 1 ? <CheckCircle2 size={24} /> : s.n}
                       </div>
                       <div className="flex flex-col">
                          <h4 className={`text-sm font-black uppercase tracking-widest transition-colors ${step === i + 1 ? 'text-blue-600' : 'text-slate-400'}`}>{s.t}</h4>
                          <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">{s.d}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-20 p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden">
                 <ShieldCheck className="text-blue-400 mb-6" size={32} />
                 <h4 className="text-white font-black text-xl mb-2 tracking-tight">Encrypted Upload</h4>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    All documents are encrypted with AES-256 before being stored in our secure government vault.
                 </p>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
              </div>
           </div>
        </div>

        {/* Right Side: Form Wizard */}
        <div className="lg:w-2/3 bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10 md:p-20 relative min-h-[700px] flex flex-col">
           {error && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 text-sm font-bold">
                <AlertCircle size={20} />
                {error}
             </motion.div>
           )}

           <div className="flex-grow">
              <AnimatePresence mode="wait">
                 {step === 1 && renderStepOne()}
                 {step === 2 && renderStepTwo()}
                 {step === 3 && renderStepThree()}
                 {step === 4 && renderStepFour()}
              </AnimatePresence>
           </div>

           <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center">
              {step > 1 ? (
                 <button onClick={prevStep} className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
                    <ChevronLeft size={18} /> Previous Step
                 </button>
              ) : <div />}

              {step < totalSteps ? (
                 <button onClick={nextStep} className="btn-premium group">
                    Continue Next <ChevronRight size={20} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                 </button>
              ) : (
                 <button onClick={handleSubmit} disabled={loading} className="px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-3">
                    {loading ? 'Processing...' : 'Complete Final Submission'}
                    {!loading && <Sparkles size={20} />}
                 </button>
              )}
           </div>
        </div>

      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
         {activePreview && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6 lg:p-12"
            >
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-[3rem] w-full max-w-6xl h-full flex flex-col shadow-2xl overflow-hidden"
               >
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                           <Eye size={20} />
                        </div>
                        <div>
                           <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase">{activePreview.name}</h3>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Identity Preview</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setActivePreview(null)} 
                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-110 transition-transform"
                     >
                        <X size={20} />
                     </button>
                  </div>
                  <div className="flex-1 bg-slate-100 p-2 overflow-hidden relative">
                     {activePreview.type === 'application/pdf' ? (
                        <iframe 
                           src={activePreview.url} 
                           className="w-full h-full border-0 rounded-[2rem]" 
                           title="PDF Preview" 
                        />
                     ) : activePreview.type.startsWith('image/') ? (
                        <div className="w-full h-full flex items-center justify-center p-8">
                           <img 
                              src={activePreview.url} 
                              alt="Preview" 
                              className="max-w-full max-h-full object-contain rounded-2xl shadow-lg" 
                           />
                        </div>
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <div className="text-center">
                              <FileText size={64} className="text-slate-200 mx-auto mb-4" />
                              <p className="text-slate-400 font-bold">Preview not supported for this file type</p>
                           </div>
                        </div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default SubmitApplication;
