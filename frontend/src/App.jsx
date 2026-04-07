import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { BrokerProvider } from './store/BrokerContext';
import Home from './Home';
import { TerminalShell } from './components/layout/TerminalShell';
import { StartupScreen } from './components/layout/StartupScreen';
import ConnectBroker from './pages/ConnectBroker';
import { Sidebar } from './components/layout/Sidebar';
import { StrategyBuilder } from './pages/StrategyBuilder';
import { Backtest } from './pages/Backtest';
import { Optimization } from './pages/Optimization';
import { MonteCarlo } from './pages/MonteCarlo';

function TerminalRoute() {
  const { user, loading } = useAuth();
  const [booting, setBooting] = useState(true);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  if (booting) {
    return <StartupScreen onComplete={() => setBooting(false)} />;
  }

  return <TerminalShell />;
}

function AppLayout() {
  const location = useLocation();
  // Landing page has no sidebar
  if (location.pathname === '/') return <Home />;

  return (
    <Sidebar>
      <Routes>
        <Route path="/terminal" element={<TerminalRoute />} />
        <Route path="/connect" element={<ConnectBroker />} />
        <Route path="/strategy" element={<StrategyBuilder />} />
        <Route path="/backtest" element={<Backtest />} />
        <Route path="/optimization" element={<Optimization />} />
        <Route path="/montecarlo" element={<MonteCarlo />} />
        <Route path="/settings" element={<Navigate to="/connect" replace />} />
        <Route path="/*" element={<TerminalRoute />} />
      </Routes>
    </Sidebar>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrokerProvider>
        <AppLayout />
      </BrokerProvider>
    </AuthProvider>
  );
}