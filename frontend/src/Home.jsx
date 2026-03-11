import React, { useState } from 'react';
import AuthModal from './AuthModal';

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white/20 selection:text-white overflow-hidden">
      {/* Background Depth Effects */}
      <div className="fixed inset-0 z-0 flex justify-center pointer-events-none">
         {/* Subtle Grid Pattern */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTM5LjUgMzkuNXoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTAgMGgwLjV2MzkuNUgwem0zOS41IDBoMC41djM5LjVoLTAuNXoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] mix-blend-overlay"></div>
         
         {/* Deep Blurred Gradients centered more securely behind content */}
         <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] bg-white/5 blur-[200px] rounded-full"></div>
         <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] bg-white/5 blur-[200px] rounded-full"></div>
      </div>

      {/* Floating Pill Navbar */}
      <div className="fixed top-6 w-full flex justify-center z-50 px-4">
        <nav className="flex items-center justify-between px-6 py-3 bg-[#0B0F19]/80 backdrop-blur-3xl border border-white/10 rounded-full w-full max-w-7xl shadow-2xl">
          <div className="flex items-center space-x-3 text-2xl font-black tracking-tighter text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-500 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
            <span>FX-Master</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
             <a href="#platform" className="hover:text-white transition-colors">Platform</a>
             <a href="#strategies" className="hover:text-white transition-colors">Strategies</a>
             <a href="#backtest" className="hover:text-white transition-colors">Backtest</a>
             <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => openAuth('login')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors tracking-wide">
              Log In
            </button>
            <button onClick={() => openAuth('register')} className="px-6 py-2.5 text-sm font-bold text-black bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-200 transition-all duration-300">
              Open Account
            </button>
          </div>
        </nav>
      </div>

      <main className="relative z-10 flex flex-col items-center w-full min-h-screen pt-24 px-6 md:px-12">
        {/* ======== HERO SECTION ======== */}
        <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Left Side: Content */}
          <div className="flex flex-col items-start z-10 space-y-8">
            {/* Version Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
               </span>
               <span className="text-xs font-semibold tracking-wide text-white uppercase">v2.0 Trading Engine Live</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl">
              Autonomous<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
                Forex Trading
              </span> Engine
            </h1>
            
            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-400 max-w-lg leading-relaxed font-light">
              Build, backtest, optimize, and deploy automated forex trading strategies across multiple brokers using AI powered execution.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 w-full sm:w-auto">
              <button onClick={() => openAuth('register')} className="w-full sm:w-auto px-8 py-4 text-base font-bold text-black bg-white rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300">
                Get Started
              </button>
              <button className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-transparent border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 shadow-md">
                View Documentation
              </button>
            </div>
            
            {/* Minimal Stat Line beneath buttons */}
            <div className="flex items-center space-x-8 pt-6 border-t border-white/10 w-full mt-6">
                <div>
                  <div className="text-xl font-bold text-white tracking-tight">0.1ms</div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Execution Speed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tight">150+</div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">FX Pairs Supported</div>
                </div>
            </div>
          </div>

          {/* Right Side: Visuals (Robot + Floating Elements) */}
          <div className="relative z-10 flex justify-center lg:justify-end w-full h-[650px] items-center">
             
             {/* Main Visual Container */}
             <div className="relative w-full max-w-xl aspect-square flex items-center justify-center">
                
                {/* Robot Ambient Backlight */}
                <div className="absolute inset-0 bg-white/5 blur-[90px] rounded-full pointer-events-none scale-110 object-contain"></div>
                
                {/* 
                   Using mix-blend-screen to strip the true black background off dynamically. 
                */}
                <img 
                  src="/robot_trader_hero.png?v=3" 
                  alt="AI Trading Assistant Robot" 
                  className="relative z-10 w-full h-full object-contain mix-blend-screen scale-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-3xl"
                />
                
                {/* Floating Glassmorphism UI Card 1 */}
                <div className="absolute top-20 -left-6 bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-[0_30px_50px_rgba(0,0,0,0.8)] z-20 animate-float-delay-1 w-56 hidden sm:block">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Execution</span>
                       <span className="relative flex h-2.5 w-2.5">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                       </span>
                    </div>
                    <div className="text-lg font-bold text-white mb-1">Buy EUR/USD</div>
                    <div className="text-sm text-gray-300 font-mono font-medium tracking-wide">1.0924 <span className="text-gray-500">@ 50 lots</span></div>
                </div>

                {/* Floating Glassmorphism UI Card 2 */}
                <div className="absolute bottom-28 -right-8 lg:-right-16 bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-20 animate-float-delay-2 w-64 hidden sm:block">
                   <div className="flex items-end justify-between">
                       <div>
                         <div className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Daily PnL</div>
                         <div className="text-2xl font-black text-white tracking-tight">+$12,450</div>
                       </div>
                       {/* Animated Glowing Bar Chart Graphic */}
                       <div className="flex items-end space-x-1.5 h-10 w-20">
                          <div className="w-full bg-white/20 h-1/4 rounded-t-sm"></div>
                          <div className="w-full bg-white/40 h-2/4 rounded-t-sm"></div>
                          <div className="w-full bg-gray-300/80 h-3/4 rounded-t-sm"></div>
                          <div className="w-full bg-gradient-to-t from-gray-300 to-white h-full rounded-t-sm shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                       </div>
                   </div>
                </div>

                {/* Cyberpunk abstract structural elements framing the robot */}
                <div className="absolute top-10 right-0 w-40 h-40 border-t border-r border-white/10 rounded-tr-3xl"></div>
                <div className="absolute bottom-10 left-0 w-40 h-40 border-b border-l border-white/10 rounded-bl-[40px]"></div>
             </div>
          </div>
        </section>

        {/* ======== SOCIAL PROOF LOGOS ======== */}
        <section className="w-full max-w-7xl mx-auto py-16 border-y border-white/5 opacity-80 flex flex-col items-center">
            <p className="text-sm text-gray-400 font-medium tracking-widest uppercase mb-8">Powering elite algorithmic trading firms globally</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center grayscale opacity-60">
                <div className="text-2xl font-black tracking-tighter">QUANT<span className="font-light">BASE</span></div>
                <div className="text-xl font-bold tracking-widest uppercase">Apex<span className="text-white">Capital</span></div>
                <div className="text-2xl font-serif italic font-bold">Nexus Point</div>
                <div className="text-xl font-mono tracking-tighter">ALGO<span className="text-gray-500">TRONIC</span></div>
                <div className="text-xl font-bold tracking-wide">OAK<span className="font-light">RIDGE</span></div>
            </div>
        </section>

        {/* ======== PLATFORM BENTO GRID ======== */}
        <section id="platform" className="w-full max-w-7xl mx-auto py-32 flex flex-col items-center">
           <div className="text-center max-w-2xl mb-16">
               <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                   Engineered for <span className="text-gray-400">Absolute Precision</span>
               </h2>
               <p className="text-lg text-gray-400 font-light">
                   Everything you need to run high-frequency, institutional-grade automated strategies from a single platform.
               </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
               {/* Large Card 1 */}
               <div className="col-span-1 md:col-span-2 bg-[#0A0D14] border border-white/10 rounded-3xl p-10 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10 w-full h-full flex flex-col justify-between">
                       <div className="mb-24">
                           <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                               </svg>
                           </div>
                           <h3 className="text-3xl font-bold text-white mb-3">Ultra-Low Latency</h3>
                           <p className="text-gray-400 max-w-md line-clamp-2">Direct cross-connects to major liquidity providers ensuring trades are routed and executed in under 0.1ms.</p>
                       </div>
                       
                       {/* Visual Element */}
                       <div className="absolute bottom-0 right-0 w-[80%] h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
                       <div className="absolute -bottom-10 -right-10 w-[90%] opacity-50 font-mono text-xs text-gray-500 leading-tight">
                           {Array.from({length: 8}).map((_, i) => (
                               <div key={i} className="whitespace-nowrap">
                                   [SYS] {Date.now()-i*100}ms - Route optimized via LP_XYZ | Latency: 0.0{Math.floor(Math.random()*9)}ms | OK
                               </div>
                           ))}
                       </div>
                   </div>
               </div>

               {/* Tall Card 2 */}
               <div className="col-span-1 bg-[#0A0D14] border border-white/10 rounded-3xl p-10 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10">
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Bank-Grade Security</h3>
                   <p className="text-gray-400 relative z-10">Military-grade AES-256 encryption. Your API keys are strictly stored in isolated HSM vaults.</p>
                   
                   <div className="absolute -right-8 -bottom-8 w-48 h-48 border border-white/5 rounded-full flex items-center justify-center">
                       <div className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center">
                           <div className="w-16 h-16 border border-white/10 rounded-full animate-pulse"></div>
                       </div>
                   </div>
               </div>

               {/* Wide Card 3 */}
               <div className="col-span-1 md:col-span-3 bg-[#0A0D14] border border-white/10 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between group overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                   <div className="md:w-1/2 relative z-10 space-y-4 mb-8 md:mb-0">
                       <h3 className="text-3xl font-bold text-white">Universal Broker API</h3>
                       <p className="text-gray-400">Write your algorithm once. Our adapter normalizes execution across dozens of supported brokers seamlessly without code changes.</p>
                       <div className="flex space-x-4 pt-4">
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">Interactive Brokers</span>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">AngelOne</span>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white">OANDA</span>
                           <span className="px-3 py-1 text-xs text-gray-500 rounded-full flex items-center">+12 More</span>
                       </div>
                   </div>
                   <div className="md:w-1/3 flex justify-center relative z-10">
                       {/* Abstract generic node graph */}
                       <div className="relative w-40 h-40">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20 flex items-center justify-center">
                               <div className="w-4 h-4 bg-black rounded-sm"></div>
                           </div>
                           
                           {/* Connecting Lines */}
                           <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white/20 -translate-y-1/2 -rotate-45 origin-left"></div>
                           <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white/20 -translate-y-1/2 rotate-12 origin-left"></div>
                           <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white/20 -translate-y-1/2 rotate-90 origin-left"></div>
                           <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white/20 -translate-y-1/2 rotate-[160deg] origin-left"></div>
                           <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-white/20 -translate-y-1/2 -rotate-[135deg] origin-left"></div>
                           
                           {/* End nodes */}
                           <div className="absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white/30 bg-black"></div>
                           <div className="absolute bottom-10 -right-6 w-3 h-3 rounded-full border-2 border-white/30 bg-black"></div>
                           <div className="absolute -bottom-6 left-1/2 w-5 h-5 rounded-full border-2 border-white/30 bg-black"></div>
                           <div className="absolute bottom-6 -left-6 w-4 h-4 rounded-full border-2 border-white/30 bg-black"></div>
                           <div className="absolute top-4 -left-4 w-3 h-3 rounded-full border-2 border-white/30 bg-black animate-pulse bg-white text-white"></div>
                       </div>
                   </div>
               </div>
           </div>
        </section>

        {/* ======== STRATEGIES CODE PREVIEW ======== */}
        <section id="strategies" className="w-full max-w-7xl mx-auto py-32 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                    Deploy complex models <span className="text-gray-400">in elegant code.</span>
                </h2>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                    Stop worrying about WebSocket lifecycles, order deduplication, and retry logic. FX-Master abstracts the complexity away, allowing you to focus purely on your alpha.
                </p>
                <ul className="space-y-4 pt-6 text-gray-300">
                    <li className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span>Python & TypeScript SDKs Available</span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span>Event-driven lifecycle hooks</span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span>Built-in trailing stops & TP/SL management</span>
                    </li>
                </ul>
            </div>
            <div className="lg:w-1/2 w-full">
                {/* Mock Code Editor */}
                <div className="bg-[#0A0D14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-white/20"></div>
                            <div className="w-3 h-3 rounded-full bg-white/20"></div>
                            <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        </div>
                        <div className="mx-auto text-xs text-gray-500 font-mono">strategy.py</div>
                    </div>
                    <div className="p-6 text-sm font-mono leading-loose overflow-x-auto text-gray-300">
                        <div><span className="text-gray-500">from</span> fx_master <span className="text-gray-500">import</span> Engine, Strategy</div>
                        <div className="mt-4"><span className="text-gray-500"># Initialize the trading engine</span></div>
                        <div>engine = Engine(api_key=<span className="text-gray-400">"sk_live_qT8x..."</span>)</div>
                        <div className="mt-4"><span className="text-gray-500"># Define risk parameters & pair</span></div>
                        <div>config = {'{'}</div>
                        <div className="pl-4">pair: <span className="text-gray-400">"EUR/USD"</span>,</div>
                        <div className="pl-4">size: <span className="text-gray-400">50</span>, <span className="text-gray-600"># Standard Lots</span></div>
                        <div className="pl-4">stop_loss_pips: <span className="text-gray-400">15</span></div>
                        <div>{'}'}</div>
                        <div className="mt-4"><span className="text-gray-500"># Deploy algorithm live</span></div>
                        <div>engine.deploy(</div>
                        <div className="pl-4">strategy=Strategy.MACD_CROSSOVER,</div>
                        <div className="pl-4">config=config</div>
                        <div>)</div>
                        <div className="mt-4 animate-pulse"><span className="text-white border-b-2 border-white">_</span></div>
                    </div>
                </div>
            </div>
        </section>

        {/* ======== PRICING ======== */}
        <section id="pricing" className="w-full max-w-7xl mx-auto py-32 border-t border-white/5">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                   Transparent Pricing
               </h2>
               <p className="text-lg text-gray-400 font-light">
                   No execution fees, no hidden spreads. Just a flat technology fee for accessing the most powerful engine.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Pro Tier */}
                <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-10 flex flex-col relative overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Pro Quant</h3>
                        <p className="text-gray-400 text-sm">For independent quantitative traders.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-extrabold text-white">$199</span>
                        <span className="text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 text-gray-300 font-light mb-10 flex-1">
                        <li className="flex relative pl-6"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span> 3 Live Executing Strategies</li>
                        <li className="flex relative pl-6"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span> Unlimited Backtesting (Historical)</li>
                        <li className="flex relative pl-6"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span> Standard Market Execution Priority</li>
                        <li className="flex relative pl-6"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span> Community Discord Support</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl text-black bg-white font-bold hover:bg-gray-200 transition-colors">Start 14-Day Free Trial</button>
                </div>
                
                {/* Institutional Tier */}
                <div className="bg-[#111827]/30 border border-white/20 rounded-3xl p-10 flex flex-col relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
                    <div className="mb-6">
                        <div className="inline-block px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">Enterprise</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Institutional</h3>
                        <p className="text-gray-400 text-sm">For hedge funds and family offices.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-extrabold text-white">Custom</span>
                    </div>
                    <ul className="space-y-4 text-gray-300 font-light mb-10 flex-1">
                        <li className="flex relative pl-6 text-white"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 border border-white rounded-full"></span> Custom API limits & throughput</li>
                        <li className="flex relative pl-6 text-white"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 border border-white rounded-full"></span> Direct dark pool & Tier-1 LP routing</li>
                        <li className="flex relative pl-6 text-white"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 border border-white rounded-full"></span> Dedicated Account Manager</li>
                        <li className="flex relative pl-6 text-white"><span className="absolute left-0 top-1.5 w-1.5 h-1.5 border border-white rounded-full"></span> SLA Guarantees (99.999% Uptime)</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl text-white border border-white/20 font-bold hover:bg-white/10 transition-colors">Contact Sales</button>
                </div>
            </div>
        </section>

        {/* ======== FINAL CTA ======== */}
        <section className="w-full py-32 border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.01]"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
                <h2 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">Ready to automate<br/><span className="text-gray-500">your edge?</span></h2>
                <p className="text-xl text-gray-400 font-light mb-10">Join top algorithmic traders building the future of finance.</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={() => openAuth('register')} className="w-full sm:w-auto px-10 py-5 text-lg font-bold text-black bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                        Initialize Workspace
                    </button>
                </div>
            </div>
        </section>

        {/* ======== FOOTER ======== */}
        <footer className="w-full max-w-7xl mx-auto py-12 px-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-300 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
                <span className="font-bold text-gray-300 tracking-tight">FX-Master</span>
                <span className="ml-2">© 2026. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
        </footer>

        {/* Global Auth Modal Overlay */}
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          initialMode={authMode} 
        />
      </main>
    </div>
  );
}