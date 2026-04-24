import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import BankApplicationDetail from './pages/bank/ApplicationDetail';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackApplication from './pages/TrackApplication';
import Profile from './pages/Profile';

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
import BusinessProposal from './pages/BusinessProposal';
import NotFound from './pages/NotFound';

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

const LegacyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/officer/review/${id}`} replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'citizen': return '/citizen/dashboard';
      case 'municipality_officer': return '/officer/dashboard';
      case 'bank_officer': return '/bank/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <>
      {!isHomePage && <Navbar />}
      <Routes>
        {/* Legacy Alias for older notifications */}
        <Route path="/officer/application/:id" element={<LegacyRedirect />} />

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<TrackApplication />} />
        <Route path="/business" element={<BusinessProposal />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

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
        <Route path="/officer/review/:id" element={
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

        <Route path="/bank/application/:id" element={
         <PrivateRoute allowedRoles={['bank_officer', 'admin']}>
           <BankApplicationDetail />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to={getDashboardLink()} replace />} />
      </Routes>
      <Footer />
    </>
  );
}



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'premium-toast',
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '1.5rem',
                padding: '1.25rem 2rem',
                fontSize: '0.75rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              },
            }}
          />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
