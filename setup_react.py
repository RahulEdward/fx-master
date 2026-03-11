import os

base_dir = "d:/fx-master/frontend"

files = {
    "package.json": """{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}""",
    "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})""",
    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay-1': 'float 6s ease-in-out 2s infinite',
        'float-delay-2': 'float 6s ease-in-out 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}""",
    "postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}""",
    "index.html": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FX-Master Landing Page</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>""",
    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#0b0f19] text-white;
  }
}""",
    "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)""",
    "src/App.jsx": """import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-[#7c3aed] selection:text-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#111827]">
        <div className="flex items-center space-x-2 text-2xl font-black tracking-tighter">
          <span className="text-[#00e5ff]">FX</span>
          <span>Master</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-[#00e5ff] transition-colors">Features</a>
          <a href="#preview" className="hover:text-[#00e5ff] transition-colors">Platform</a>
          <a href="#how-it-works" className="hover:text-[#00e5ff] transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-[#00e5ff] transition-colors">Pricing</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log In
          </button>
          <button className="px-6 py-2 text-sm font-bold text-[#0b0f19] bg-[#00e5ff] rounded-full shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:bg-cyan-300 transition-all duration-300">
            Open Account
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center w-full">
        <section className="relative w-full max-w-7xl mx-auto px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[150px] opacity-20 pointer-events-none -translate-y-1/2"></div>
          
          <div className="flex flex-col items-start z-10 space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Automate <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]">
                Forex Trading
              </span><br/>
              With Intelligence.
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed">
              Experience the power of a fully automated AI strategy execution engine. Perform real-time market analysis and connect deeply with top-tier brokers to maximize your edge.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-[#0b0f19] bg-[#00e5ff] rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:bg-cyan-300 transition-all duration-300 transform hover:-translate-y-1">
                Start Trading
              </button>
              <button className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-[#111827] border border-gray-800 rounded-2xl hover:bg-gray-800 hover:border-[#7c3aed] transition-all duration-300">
                View Demo
              </button>
            </div>

            <div className="pt-8 flex items-center space-x-6">
              <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Trusted By</span>
              <div className="flex space-x-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="text-xl font-bold italic">OANDA</div>
                <div className="text-xl font-bold tracking-tight">FXCM</div>
                <div className="text-xl font-bold">TradingView</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center lg:justify-end">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#00e5ff]/20 rounded-full animate-spin-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-[#7c3aed]/30 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
            
            <img 
              src="/robot_trader_hero.png" 
              alt="AI Trading Mascot Assistant" 
              className="relative w-full max-w-2xl object-cover drop-shadow-[0_0_50px_rgba(0,229,255,0.2)] animate-float"
            />

            <div className="absolute top-1/4 -left-8 bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-xl px-4 py-3 shadow-2xl animate-float-delay-1">
              <div className="text-xs text-gray-400 font-medium">EUR/USD</div>
              <div className="text-lg font-bold text-[#00e5ff]">1.0924</div>
              <div className="text-xs text-green-400">+0.12%</div>
            </div>
            
            <div className="absolute bottom-1/4 -right-12 bg-[#111827]/80 backdrop-blur-xl border border-[#7c3aed]/40 rounded-xl px-4 py-3 shadow-2xl animate-float-delay-2">
               <div className="text-xs text-gray-400 font-medium">Execution</div>
               <div className="text-sm font-bold text-white">Strategy Deployed</div>
               <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] w-3/4"></div>
               </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-[#111827]/50 py-24 px-8 border-y border-[#111827]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold mb-4">Precision Engineering for <span className="text-[#00e5ff]">Traders</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Equip your portfolio with institutional-grade AI modeling, backtesting infrastructure, and instant order routing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {['AI Trading', 'Strategy Automation', 'Backtesting Engine', 'Multi Broker Connect'].map((title, i) => (
                <div key={i} className="bg-[#0b0f19] p-8 rounded-2xl border border-gray-800 hover:border-[#7c3aed] transition-all hover:-translate-y-2 group">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl mb-6 flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#00e5ff] to-[#7c3aed] rounded-md"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Deploy complex quantitative models without writing thousands of lines of code. Our engine handles the rest.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="preview" className="relative w-full max-w-7xl mx-auto px-8 py-32 text-center">
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-[#00e5ff] rounded-full blur-[200px] opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Pro-Grade <span className="text-[#7c3aed]">Trading Terminal</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16">Monitor live executions, track active metrics across multiple brokers, and review complex signals generated by the AI.</p>
            
            <div className="w-full bg-[#111827] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden shadow-[#00e5ff]/5">
               <div className="flex items-center px-4 py-3 bg-[#0b0f19] border-b border-gray-800">
                 <div className="flex space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                 </div>
               </div>
               <div className="p-8 pb-0 aspect-video flex gap-8">
                  <div className="w-1/4 bg-[#0b0f19] rounded-t-xl p-4 border border-b-0 border-gray-800 gap-4 flex flex-col hidden lg:flex">
                     <div className="h-20 bg-gray-800/50 rounded-lg"></div>
                     <div className="h-32 bg-gray-800/50 rounded-lg"></div>
                     <div className="h-full bg-gray-800/50 rounded-t-lg"></div>
                  </div>
                  <div className="flex-1 bg-[#0b0f19] rounded-t-xl p-4 border border-b-0 border-gray-800 flex flex-col gap-4">
                     <div className="w-full h-3/5 border border-gray-800 rounded-lg bg-gradient-to-t from-[#00e5ff]/10 to-transparent"></div>
                     <div className="w-full flex-1 bg-gray-800/30 rounded-t-lg border border-b-0 border-gray-800"></div>
                  </div>
               </div>
            </div>
        </section>

        <section id="how-it-works" className="w-full bg-[#111827]/50 py-24 px-8 border-y border-[#111827]">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold mb-4">Deploy in <span className="text-[#00e5ff]">Minutes</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                {step: '01', title: 'Connect Broker', desc: 'Securely link real/demo accounts via API keys or OAuth.'},
                {step: '02', title: 'Deploy Strategy', desc: 'Build using visual tools or code Python strategies.'},
                {step: '03', title: 'Automated Trading', desc: 'Let the system handle executions and risk management 24/7.'}
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-6xl font-black text-[#111827] text-stroke text-stroke-[#7c3aed] mb-6 tracking-tighter">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-24 px-8">
           <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-5xl font-bold mb-16">Scale Your Operations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-[#111827] p-8 rounded-3xl border border-gray-800">
                  <h3 className="text-xl font-bold mb-2">Backtester</h3>
                  <div className="text-4xl font-extrabold mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                  <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                    <li>✓ Unlimited Simulation</li>
                    <li>✓ Basic Market Data</li>
                    <li>✓ 1 Strategy Active</li>
                  </ul>
                  <button className="w-full py-3 bg-[#0b0f19] border border-gray-700 rounded-xl hover:border-[#00e5ff] transition-colors font-medium">Get Started for Free</button>
                </div>

                <div className="bg-gradient-to-b from-[#7c3aed]/20 to-[#111827] p-8 rounded-3xl border border-[#7c3aed]">
                  <h3 className="text-xl font-bold mb-2 text-[#00e5ff]">Pro Trader</h3>
                  <div className="text-4xl font-extrabold mb-6">$99<span className="text-lg text-gray-300 font-normal">/mo</span></div>
                   <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                    <li>✓ Live Multi-Broker Execution</li>
                    <li>✓ High-Frequency Webhooks</li>
                    <li>✓ Sub-millisecond routing</li>
                    <li>✓ Advanced AI Optimization</li>
                  </ul>
                  <button className="w-full py-3 bg-[#00e5ff] text-[#0b0f19] rounded-xl hover:bg-cyan-300 transition-colors font-bold shadow-[0_0_20px_rgba(0,229,255,0.2)]">Upgrade to Pro</button>
                </div>
              </div>
           </div>
        </section>

        <section className="w-full bg-[#7c3aed] text-white py-20 px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTM5LjUgMzkuNXoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTAgMGgwLjV2MzkuNUgwem0zOS41IDBoMC41djM5LjVoLTAuNXoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Outperform the Market?</h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl">Join elite quants and institutional traders automating their logic with FX-Master today.</p>
            <button className="px-10 py-4 text-lg font-bold text-[#7c3aed] bg-white rounded-2xl hover:bg-gray-100 transition-all shadow-2xl transform hover:-translate-y-1">
              Start Free Trial
            </button>
          </div>
        </section>

      </main>
      
      <footer className="w-full py-8 text-center text-sm text-gray-600 border-t border-[#111827]">
        © 2026 FX-Master Labs. All Rights Reserved.
      </footer>
    </div>
  );
}"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
