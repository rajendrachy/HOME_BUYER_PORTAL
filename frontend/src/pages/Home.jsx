import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    { icon: "🎯", title: "Government Approved", desc: "Official Nepal Government Program", color: "from-blue-500 to-blue-600" },
    { icon: "💰", title: "15% Subsidy", desc: "Maximum financial support", color: "from-green-500 to-green-600" },
    { icon: "⚡", title: "15 Days Processing", desc: "Fastest approval process", color: "from-purple-500 to-purple-600" },
    { icon: "📱", title: "100% Digital", desc: "Paperless application", color: "from-orange-500 to-orange-600" }
  ];

  const stats = [
    { value: "500+", label: "Happy Families", color: "text-blue-600" },
    { value: "₹50Cr+", label: "Subsidy Distributed", color: "text-green-600" },
    { value: "8+", label: "Partner Banks", color: "text-purple-600" },
    { value: "15 Days", label: "Avg Processing", color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🏠</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">HomeBuyer Nepal</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
              <Link to="/track" className="text-gray-700 hover:text-blue-600 font-medium transition">Track</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Split Layout */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm mb-6 border border-gray-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-600">Active Program • 500+ Enrolled</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Dream Home
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Starts Here</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Get up to 15% government subsidy with our hassle-free, fully digital process. 
                Join hundreds of happy families who've already achieved their dream.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                  <span className="relative z-10">Apply for Subsidy</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/track" className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                  Track Application
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center shadow-sm">
                      <span className="text-blue-600 text-xs">✓</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Trusted by <span className="font-semibold text-gray-700">500+ families</span> across Nepal</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                      <div className="text-3xl font-bold mb-1 ${stat.color}">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-center text-gray-600">✨ "This program changed my life. Got my dream home in just 12 days!"</p>
                  <p className="text-xs text-center text-gray-500 mt-2">- Ram Bahadur, Kathmandu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Benefits You'll Love</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Government-backed program designed to make home ownership accessible for all Nepali citizens</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group relative bg-white border border-gray-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-r ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Timeline Style */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Get Your Home in 3 Easy Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">No complex paperwork, no middlemen - just a straightforward digital process</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 transform -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Eligibility</h3>
                <p className="text-gray-500 text-sm">Quick 2-minute assessment to see if you qualify</p>
              </div>
              <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Application</h3>
                <p className="text-gray-500 text-sm">Fill your details and upload documents online</p>
              </div>
              <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Loan & Move In</h3>
                <p className="text-gray-500 text-sm">Choose best offer from partner banks and move in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from real families who found their dream home</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ram Bahadur", location: "Kathmandu", text: "The process was incredibly smooth. Got my subsidy approved in just 10 days!", rating: 5, image: "👨" },
              { name: "Sita Sharma", location: "Lalitpur", text: "Best government initiative ever! Highly recommended for first-time buyers.", rating: 5, image: "👩" },
              { name: "Hari KC", location: "Bhaktapur", text: "Great support from the team. Made buying my first home stress-free.", rating: 5, image: "🧔" }
            ].map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl">
                    {t.image}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(t.rating)].map((_, j) => <span key={j}>★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">Join 500+ families who have already achieved their dream of home ownership</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              Apply Now - It's Free
            </Link>
            <Link to="/track" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
              Check Application Status
            </Link>
          </div>
          <p className="text-blue-100 text-sm mt-6">No hidden fees • 100% transparent • Government-backed</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">🏠</span>
                </div>
                <span className="text-white font-bold">HomeBuyer Nepal</span>
              </div>
              <p className="text-sm">Government initiative making home ownership accessible for every Nepali citizen.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/track" className="hover:text-white transition">Track Application</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 01-1234567</li>
                <li>✉️ support@homebuyer.gov.np</li>
                <li>📍 Singha Durbar, Kathmandu</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Office Hours</h4>
              <ul className="space-y-2 text-sm">
                <li>Sunday - Thursday: 10am - 5pm</li>
                <li>Friday: 10am - 3pm</li>
                <li>Saturday: Closed</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Home Buyer Portal. Government of Nepal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;