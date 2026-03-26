import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">🏠 Home Buyer Portal</Link>
          
          <div className="flex space-x-4 items-center">
            <Link to="/track" className="hover:text-blue-200">Track Application</Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-blue-200">
                  Dashboard
                </Link>
                <span className="text-sm">👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
