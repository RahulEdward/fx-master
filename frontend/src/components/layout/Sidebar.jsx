import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { TerminalSquare, FlaskConical, Play, Target, Network, Settings, Database } from 'lucide-react';

export function Sidebar({ children }) {
  const location = useLocation();

  const navItems = [
    { name: 'Terminal', path: '/terminal', icon: TerminalSquare },
    { name: 'Strategy Builder', path: '/strategy', icon: FlaskConical },
    { name: 'Backtest', path: '/backtest', icon: Play },
    { name: 'Optimization', path: '/optimization', icon: Target },
    { name: 'Monte Carlo', path: '/montecarlo', icon: Network },
    { name: 'Broker config', path: '/connect', icon: Database },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#08080d] overflow-hidden text-zinc-200">
      {/* Sidebar Navigation */}
      <div className="w-14 shrink-0 bg-[#0a0a12] border-r border-[#1e1e30] flex flex-col items-center py-4">
        {/* App Icon */}
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
          <span className="text-[10px] font-black text-white px-1">FX</span>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2 flex-1 w-full px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`group relative flex items-center justify-center p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-[#1e1e30] border border-[#2a2a40] rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.name}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="px-2">
           <NavLink
              to="/settings"
              className="group relative flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
           >
              <Settings size={20} strokeWidth={2} />
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#1e1e30] border border-[#2a2a40] rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Settings
              </div>
           </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#08080d]">
        {children}
      </div>
    </div>
  );
}
