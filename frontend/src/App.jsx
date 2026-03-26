import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackApplication from './pages/TrackApplication';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';
import SubmitApplication from './pages/citizen/SubmitApplication';
import ApplicationDetail from './pages/citizen/ApplicationDetail';

// Officer Pages
import OfficerDashboard from './pages/officer/Dashboard';
import ApplicationReview from './pages/officer/ApplicationReview';
import ApplicationsList from './pages/officer/ApplicationsList';

// Bank Pages
import BankDashboard from './pages/bank/Dashboard';
import ApprovedApplications from './pages/bank/ApprovedApplications';
import SubmitOffer from './pages/bank/SubmitOffer';
import MyOffers from './pages/bank/MyOffers';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<TrackApplication />} />

        {/* Citizen Routes */}
        <Route path="/citizen/dashboard" element={
          <PrivateRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </PrivateRoute>
        } />
        <Route path="/citizen/submit" element={
          <PrivateRoute allowedRoles={['citizen']}>
            <SubmitApplication />
          </PrivateRoute>
        } />
        <Route path="/citizen/application/:id" element={
          <PrivateRoute allowedRoles={['citizen']}>
            <ApplicationDetail />
          </PrivateRoute>
        } />

        {/* Municipality Officer Routes */}
        <Route path="/officer/dashboard" element={
          <PrivateRoute allowedRoles={['municipality_officer', 'admin']}>
            <OfficerDashboard />
          </PrivateRoute>
        } />
        <Route path="/officer/applications" element={
          <PrivateRoute allowedRoles={['municipality_officer', 'admin']}>
            <ApplicationsList />
          </PrivateRoute>
        } />
        <Route path="/officer/application/:id" element={
          <PrivateRoute allowedRoles={['municipality_officer', 'admin']}>
            <ApplicationReview />
          </PrivateRoute>
        } />

        {/* Bank Officer Routes */}
        <Route path="/bank/dashboard" element={
          <PrivateRoute allowedRoles={['bank_officer', 'admin']}>
            <BankDashboard />
          </PrivateRoute>
        } />
        <Route path="/bank/approved" element={
          <PrivateRoute allowedRoles={['bank_officer', 'admin']}>
            <ApprovedApplications />
          </PrivateRoute>
        } />
        <Route path="/bank/application/:id/offer" element={
          <PrivateRoute allowedRoles={['bank_officer', 'admin']}>
            <SubmitOffer />
          </PrivateRoute>
        } />
        <Route path="/bank/offers" element={
          <PrivateRoute allowedRoles={['bank_officer', 'admin']}>
            <MyOffers />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;





