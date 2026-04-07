import React, { useState } from 'react';
import { Play, Calendar, Download, Settings2 } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';

export function Backtest() {
  const [running, setRunning] = useState(false);

  return (
    <div className="flex flex-col h-full w-full bg-[#08080d] text-zinc-200">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 border-r border-[#1e1e30] bg-[#0a0a12] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Backtest Engine</h2>
            <p className="text-xs text-zinc-500">Run historical simulations on OANDA data.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Strategy</label>
              <select className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-blue-500">
                <option>momentum_ema</option>
                <option>mean_reversion</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Instrument</label>
              <select className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-blue-500">
                <option>EUR_USD</option>
                <option>GBP_USD</option>
                <option>XAU_USD</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Start Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  <input type="date" defaultValue="2023-01-01" className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white pl-8 pr-2 py-2 rounded outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">End Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  <input type="date" defaultValue="2023-12-31" className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white pl-8 pr-2 py-2 rounded outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Initial Capital ($)</label>
              <input type="number" defaultValue={10000} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e1e30]">
            <button 
              onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 2000); }}
              disabled={running}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 font-bold text-sm text-white rounded shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {running ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Running...</>
              ) : (
                <><Play size={16} fill="currentColor" /> Run Backtest</>
              )}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 bg-[#0e0e16] p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
             
             {!running ? (
               <div className="text-center z-10 space-y-4">
                 <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-400">
                    <Settings2 size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white">Ready to simulate</h3>
                 <p className="text-zinc-500 max-w-sm text-sm">Configure your parameters on the left and click "Run Backtest" to generate the performance simulation map.</p>
               </div>
             ) : (
               <div className="flex flex-col items-center text-center z-10 gap-3">
                 <div className="text-blue-400"><Play size={40} className="animate-pulse" /></div>
                 <span className="text-blue-400 font-mono tracking-widest uppercase">Computing Tick Data...</span>
                 <div className="w-64 h-1 bg-[#1e1e30] rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_forwards]"></div>
                 </div>
               </div>
             )}
        </div>
      </div>
    </div>
  );
}
