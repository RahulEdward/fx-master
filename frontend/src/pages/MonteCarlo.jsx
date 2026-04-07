import React from 'react';
import { Network, Activity } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';

export function MonteCarlo() {
  return (
    <div className="flex flex-col h-full w-full bg-[#08080d] text-zinc-200">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 border-r border-[#1e1e30] bg-[#0a0a12] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
             <h2 className="text-xl font-bold text-white mb-1">Monte Carlo</h2>
             <p className="text-xs text-zinc-500">Stochastic risk analysis and equity simulations.</p>
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Simulation Model</label>
               <select className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-purple-500">
                 <option>Randomized Trade Resampling</option>
                 <option>Geometric Brownian Motion</option>
               </select>
             </div>

             <div>
               <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Simulations (Paths)</label>
               <input type="number" defaultValue={1000} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-purple-500" />
             </div>

             <div>
               <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Confidence Interval</label>
               <select className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-purple-500">
                 <option>90%</option>
                 <option>95%</option>
                 <option>99%</option>
               </select>
             </div>
          </div>

          <div className="pt-4 border-t border-[#1e1e30]">
             <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 font-bold text-sm text-white rounded shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-2">
                <Network size={16} /> Run Probability Matrix
             </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 bg-[#0e0e16] flex flex-col p-6 items-center justify-center">
            <div className="text-center z-10 space-y-4">
                 <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-purple-400">
                    <Activity size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white">Risk Distribution</h3>
                 <p className="text-zinc-500 max-w-sm text-sm">Resample backtest paths to analyze maximum drawdown probabilities and risk of ruin.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
