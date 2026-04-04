import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);

  const handleEnable2FA = async () => {
    setIs2FALoading(true);
    try {
      const { data } = await api.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
      setShow2FASetup(true);
    } catch (err) {
      toast.error('Failed to initiate 2FA setup');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FALoading(true);
    try {
      await api.verify2FA(token);
      toast.success('Two-factor authentication enabled!');
      setShow2FASetup(false);
      // Refresh user data or update local state
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid token');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will decrease your account security.')) return;
    
    setIs2FALoading(true);
    try {
      await api.disable2FA();
      toast.success('Two-factor authentication disabled');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to disable 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <p className="text-gray-900 font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
            <p className="text-gray-900 font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
            <p className="text-gray-900 font-medium">{user?.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* SECURITY SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Security</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account by requiring a code from your phone.
              </p>
            </div>
            <div>
              {user?.isTwoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={is2FALoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  disabled={is2FALoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  Enable 2FA
                </button>
              )}
            </div>
          </div>

          {/* 2FA SETUP MODAL/UI */}
          {show2FASetup && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              {step === 2 && (
                <div className="text-center">
                  <h4 className="font-bold text-blue-900 mb-4">Step 2: Scan QR Code</h4>
                  <div className="max-w-xs mx-auto bg-white p-5 rounded-2xl border border-blue-100 mb-6 text-left shadow-sm">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Quick Instructions</p>
                    <ul className="text-[11px] text-gray-500 space-y-3 font-medium">
                      <li className="flex gap-2">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black">1</span>
                        Install <b>Google Authenticator</b> on your phone.
                      </li>
                      <li className="flex gap-2">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black">2</span>
                        Scan the QR code below using the app's camera.
                      </li>
                      <li className="flex gap-2">
                        <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black">3</span>
                        Enter the 6-digit code shown in the app below.
                      </li>
                    </ul>
                  </div>
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 bg-white p-2 rounded-lg border border-blue-200 mb-4" />
                  <div className="bg-white p-3 rounded-lg border border-blue-200 inline-block mb-6">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Manual Secret Key</p>
                    <code className="text-blue-800 font-mono font-bold">{secret}</code>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit confirmation code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={token}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setToken(val);
                      }}
                      className="w-full text-center text-4xl tracking-[0.5em] font-black p-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 focus:outline-none transition-all placeholder:text-gray-200"
                      placeholder="000000"
                    />
                    <button
                      onClick={handleVerify2FA}
                      disabled={is2FALoading || token.length !== 6}
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50"
                    >
                      Verify and Enable
                    </button>
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
