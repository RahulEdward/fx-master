import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white/20 selection:text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Depth Effects */}
      <div className="fixed inset-0 z-0 flex justify-center pointer-events-none">
         {/* Subtle Grid Pattern */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTM5LjUgMzkuNXoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTAgMGgwLjV2MzkuNUgwem0zOS41IDBoMC41djM5LjVoLTAuNXoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] mix-blend-overlay"></div>
         
         {/* Deep Blurred Gradients */}
         <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] bg-white/5 blur-[200px] rounded-full"></div>
         <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] bg-white/5 blur-[200px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-500 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center mb-8 relative">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            {/* Ping animation around logo */}
            <div className="absolute inset-0 rounded-2xl border border-white/20 animate-ping"></div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
          Terminal Dashboard
        </h1>
        <p className="text-gray-400 mb-12 max-w-md text-center font-light leading-relaxed">
          Authentication successful. Welcome to your high-performance algorithmic trading workspace.
        </p>
        
        <div className="flex flex-col space-y-4 border border-white/10 rounded-2xl p-8 bg-[#0A0D14]/80 backdrop-blur-3xl shadow-2xl mb-12 w-full max-w-sm">
           <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Status</span>
              <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                 <span className="text-[10px] uppercase tracking-wider font-bold text-green-400">Online</span>
              </div>
           </div>
           
           <div className="flex justify-between items-center border-b border-white/5 py-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Keys</span>
              <span className="text-sm font-mono text-white tracking-widest">SK_LIVE_••••</span>
           </div>

           <div className="flex justify-between items-center pt-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Session User</span>
              <span className="text-sm font-medium text-white">Authenticated</span>
           </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="text-sm text-gray-500 font-bold hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
        >
          Secure Logout
        </button>
      </div>
    </div>
  );
}
