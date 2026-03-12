import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { BrokerProvider } from './store/BrokerContext';
import Home from './Home';
import ConnectBroker from './pages/ConnectBroker';
import TradingDashboard from './pages/TradingDashboard';
import OrderPanel from './pages/OrderPanel';
import TradeHistory from './pages/TradeHistory';

function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === '/') return <Home />;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/connect', label: 'Connect Broker', icon: '🔗' },
    { path: '/trade', label: 'Place Order', icon: '💹' },
    { path: '/history', label: 'History', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      {/* Top Nav */}
      <nav className="border-b border-white/10 bg-[#0a0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">FX</span>
            </div>
            <span className="font-bold text-white tracking-tight">FX-Master</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}>
                <span className="mr-1.5">{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <button onClick={logout}
                className="text-sm text-gray-500 hover:text-white transition-colors">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/dashboard" element={<TradingDashboard />} />
          <Route path="/connect" element={<ConnectBroker />} />
          <Route path="/trade" element={<OrderPanel />} />
          <Route path="/history" element={<TradeHistory />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrokerProvider>
        <Routes>
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrokerProvider>
    </AuthProvider>
  );
}