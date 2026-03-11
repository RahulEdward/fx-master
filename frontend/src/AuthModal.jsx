import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [initialMode, isOpen]);

  // Handle password strength
  useEffect(() => {
    let strength = 0;
    if (password.length > 0) {
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    }
    setPasswordStrength(strength); // 0 to 4
  }, [password]);

  if (!isOpen) return null;

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];

  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0A0D14] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[95vh] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #0A0D14' }}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-2 z-10">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8 pb-6">
          <h2 className="text-3xl font-bold text-white mb-2">{mode === 'login' ? 'Terminal Access' : 'Initialize Account'}</h2>
          <p className="text-gray-400 text-sm mb-8">
            {mode === 'login' ? 'Enter your credentials to access your algorithmic workspace.' : 'Deploy your first autonomous strategy today.'}
          </p>

          <form className="space-y-5" onSubmit={(e) => {
            e.preventDefault();
            // Basic validation check
            if (mode === 'register' && (!passwordsMatch || !name || !email)) return;
            if (mode === 'login' && (!email || !password)) return;
            
            // Redirect to Dashboard on success!
            onClose();
            navigate('/dashboard');
          }}>
            
            {/* Registration specific fields: Name */}
            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm"
                placeholder="quant@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm tracking-[0.2em]"
                placeholder="••••••••"
              />
            </div>

            {/* Password Strength Indicator */}
            {(mode === 'register' || password.length > 0) && (
              <div className="space-y-2 mt-2 pt-2 pb-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-500">Security Strength</span>
                  <span className={password.length === 0 ? "text-gray-600" : strengthColors[passwordStrength].replace('bg-', 'text-')}>
                    {password.length === 0 ? 'None' : strengthLabels[passwordStrength]}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex space-x-1">
                  <div className={`h-full flex-1 rounded-full transition-all duration-500 ${password.length > 0 ? (passwordStrength >= 1 ? strengthColors[passwordStrength] : 'bg-red-500') : 'bg-transparent'}`}></div>
                  <div className={`h-full flex-1 rounded-full transition-all duration-500 delay-75 ${passwordStrength >= 2 ? strengthColors[passwordStrength] : 'bg-transparent'}`}></div>
                  <div className={`h-full flex-1 rounded-full transition-all duration-500 delay-150 ${passwordStrength >= 3 ? strengthColors[passwordStrength] : 'bg-transparent'}`}></div>
                  <div className={`h-full flex-1 rounded-full transition-all duration-500 delay-200 ${passwordStrength >= 4 ? strengthColors[passwordStrength] : 'bg-transparent'}`}></div>
                </div>
                {mode === 'register' && (
                  <ul className="text-[10px] text-gray-500 space-y-1.5 mt-3 font-mono tracking-tight bg-white/5 p-3 rounded-lg border border-white/5">
                    <li className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-400" : ""}`}>
                        <span>[{password.length >= 8 ? 'X' : ' '}]</span> <span>8+ characters</span>
                    </li>
                    <li className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-400" : ""}`}>
                        <span>[{/[A-Z]/.test(password) ? 'X' : ' '}]</span> <span>Uppercase letter</span>
                    </li>
                    <li className={`flex items-center space-x-2 ${/[0-9]/.test(password) ? "text-green-400" : ""}`}>
                        <span>[{/[0-9]/.test(password) ? 'X' : ' '}]</span> <span>Numeric digit</span>
                    </li>
                    <li className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-400" : ""}`}>
                        <span>[{/[^A-Za-z0-9]/.test(password) ? 'X' : ' '}]</span> <span>Special character</span>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* Registration specific fields: Confirm Password */}
            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm Password</label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                      {passwordsMatch ? 'Matches' : 'Does Not Match'}
                    </span>
                  )}
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all font-mono text-sm tracking-[0.2em] ${
                    confirmPassword.length > 0 
                      ? passwordsMatch 
                        ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500/50' 
                        : 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                      : 'border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30'
                  }`}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button className="w-full py-4 mt-6 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              {mode === 'login' ? 'Authenticate' : 'Generate Keys & Register'}
            </button>
          </form>
        </div>

        <div className="bg-white/[0.02] border-t border-white/5 p-6 text-center">
          <p className="text-sm text-gray-500">
            {mode === 'login' ? "System uninitialized? " : "Already registered? "}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-white font-bold hover:text-gray-300 ml-1 underline decoration-white/30 underline-offset-4">
              {mode === 'login' ? 'Create an account' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
