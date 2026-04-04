import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitApplication } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateCitizenship = (num) => num.length >= 5 && num.length <= 20;
const validateIncome = (income) => parseInt(income) > 0 && parseInt(income) <= 1000000;
const validatePropertyCost = (cost) => parseInt(cost) > 100000 && parseInt(cost) <= 100000000;

const SubmitApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const validateStep = (currentStep) => {
    setError('');
    let isValid = true;
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !validateEmail(formData.email) || !validatePhone(formData.phone) || !validateCitizenship(formData.citizenshipNumber) || !formData.currentAddress.trim()) {
        setError('Please fill all required personal fields correctly.');
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.employmentType || !validateIncome(formData.monthlyIncome) || !formData.employerName.trim() || !formData.district || !formData.municipality || !formData.ward || !formData.propertyType || !validatePropertyCost(formData.propertyCost)) {
        setError('Please fill all employment and property fields correctly.');
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.familyMembers || parseInt(formData.familyMembers) <= 0 || parseInt(formData.dependents) < 0) {
        setError('Please complete family information correctly.');
        isValid = false;
      }
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate final step
    if (!files.citizenshipDocument || !files.incomeProofDocument || !files.propertyDocument) {
       setError('All documents must be uploaded.');
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
      toast.success(`Application submitted! ID: ${data.applicationId}`);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  // Step content renderers
  const renderStepOne = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Personal Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-gray-700 mb-1">Full Name *</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Citizenship Number *</label><input type="text" name="citizenshipNumber" value={formData.citizenshipNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Current Address *</label><input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Permanent Address</label><input type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" /></div>
      </div>
    </motion.div>
  );

  const renderStepTwo = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Employment & Property</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <h3 className="col-span-2 font-medium text-lg mt-2 border-b pb-2">Employment</h3>
        <div>
          <label className="block text-gray-700 mb-1">Employment Type *</label>
          <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
            <option value="government">Government</option><option value="private">Private</option><option value="business">Business</option>
            <option value="foreign_employment">Foreign Employment</option><option value="self_employed">Self Employed</option><option value="unemployed">Unemployed</option>
          </select>
        </div>
        <div><label className="block text-gray-700 mb-1">Monthly Income (NPR) *</label><input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Employer Name *</label><input type="text" name="employerName" value={formData.employerName} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        
        <h3 className="col-span-2 font-medium text-lg mt-4 border-b pb-2">Target Property</h3>
        <div><label className="block text-gray-700 mb-1">District *</label><input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Municipality *</label><input type="text" name="municipality" value={formData.municipality} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Ward Number *</label><input type="number" name="ward" value={formData.ward} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Tole/Area</label><input type="text" name="tole" value={formData.tole} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" /></div>
        <div>
          <label className="block text-gray-700 mb-1">Property Type *</label>
          <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
            <option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option>
          </select>
        </div>
        <div><label className="block text-gray-700 mb-1">Property Cost (NPR) *</label><input type="number" name="propertyCost" value={formData.propertyCost} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
      </div>
    </motion.div>
  );

  const renderStepThree = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Family & Subsidy Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-gray-700 mb-1">Family Members *</label><input type="number" name="familyMembers" value={formData.familyMembers} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-gray-700 mb-1">Dependents *</label><input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" required /></div>
        <div className="md:col-span-2"><label className="block text-gray-700 mb-1">Spouse Name (if married)</label><input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" /></div>
        
        <div className="md:col-span-2 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <label className="block text-blue-900 font-semibold mb-2">Subsidy Requested (NPR)</label>
          <input type="number" name="subsidyRequested" value={formData.subsidyRequested} onChange={handleChange} placeholder="Leave blank for automatic calculation (10% of property cost)" className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          <p className="text-sm text-blue-600 mt-2">If left blank, subsidy will be automatically calculated based on your property cost.</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStepFour = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Document Uploads</h2>
      <div className="space-y-6">
        <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <label className="block text-gray-800 font-medium mb-2">🪪 Citizenship Certificate *</label>
          <input type="file" name="citizenshipDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <label className="block text-gray-800 font-medium mb-2">💰 Income Proof *</label>
          <input type="file" name="incomeProofDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
          <label className="block text-gray-800 font-medium mb-2">🏠 Property Document *</label>
          <input type="file" name="propertyDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <p className="text-sm text-center text-gray-500">Allowed formats: PDF, JPG, PNG (Max 5MB each)</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/citizen/dashboard')} className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium">
          ← Back to Dashboard
        </button>
        
        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
            <motion.div 
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span className={step >= 1 ? 'text-blue-600' : ''}>Personal</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>Employment</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>Family</span>
            <span className={step >= 4 ? 'text-blue-600' : ''}>Documents</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 min-h-[500px] flex flex-col">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>}
          
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {step === 1 && renderStepOne()}
              {step === 2 && renderStepTwo()}
              {step === 3 && renderStepThree()}
              {step === 4 && renderStepFour()}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep} 
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
            ) : <div />}
            
            {step < totalSteps ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Continue Next Step 
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
              >
                {loading ? 'Submitting...' : 'Complete Submission'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitApplication;
