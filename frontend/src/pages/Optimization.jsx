import React from 'react';
import { Target, SlidersHorizontal, BarChart3 } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';

export function Optimization() {
  return (
    <div className="flex flex-col h-full w-full bg-[#08080d] text-zinc-200">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 border-r border-[#1e1e30] bg-[#0a0a12] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Parameter Optimization</h2>
            <p className="text-xs text-zinc-500">Sweep variables to find optimal bounds.</p>
          </div>

          <div className="space-y-4">
            <div>
               <label className="block text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2">Algorithm</label>
               <select className="w-full bg-[#1e1e30] border border-[#2a2a40] text-sm text-white px-3 py-2 rounded outline-none focus:border-blue-500">
                 <option>Grid Search</option>
                 <option>Genetic Algorithm (NSGA-II)</option>
                 <option>Particle Swarm</option>
               </select>
            </div>
            
            <div className="p-3 bg-[#1e1e30]/30 border border-[#2a2a40] rounded">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">EMA_Fast_Period</span>
                  <SlidersHorizontal size={12} className="text-zinc-500" />
               </div>
               <div className="grid grid-cols-3 gap-2">
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Min</label>
                   <input type="number" defaultValue={5} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Max</label>
                   <input type="number" defaultValue={20} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Step</label>
                   <input type="number" defaultValue={1} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
               </div>
            </div>

            <div className="p-3 bg-[#1e1e30]/30 border border-[#2a2a40] rounded">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">EMA_Slow_Period</span>
                  <SlidersHorizontal size={12} className="text-zinc-500" />
               </div>
               <div className="grid grid-cols-3 gap-2">
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Min</label>
                   <input type="number" defaultValue={20} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Max</label>
                   <input type="number" defaultValue={100} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
                 <div>
                   <label className="block text-[9px] text-zinc-500 mb-1">Step</label>
                   <input type="number" defaultValue={5} className="w-full bg-[#1e1e30] border border-[#2a2a40] text-xs px-2 py-1 rounded outline-none" />
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e1e30]">
            <button className="w-full py-3 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 font-bold text-sm text-white rounded transition-all flex justify-center items-center gap-2">
               <Target size={16} /> Locate Global Maxima
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 bg-[#0e0e16] flex flex-col p-6 items-center justify-center">
            <div className="text-center z-10 space-y-4">
                 <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-400">
                    <BarChart3 size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white">Heatmap Generation Core</h3>
                 <p className="text-zinc-500 max-w-sm text-sm">Select bounds and run optimization to visualize 3D parameter landscapes.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
