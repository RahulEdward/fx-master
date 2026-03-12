import React, { useState } from 'react';
import { brokerAPI } from '../services/api';
import { useBroker } from '../store/BrokerContext';

export default function ConnectBroker() {
  const { setActiveBrokerAccount, setBrokerAccounts } = useBroker();
  const [form, setForm] = useState({ api_token: '', account_id: '', environment: 'demo' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await brokerAPI.connect(form);
      setSuccess(`Connected! Balance: ${res.data.balance} ${res.data.currency}`);
      setActiveBrokerAccount(res.data);
      const accRes = await brokerAPI.getAccounts();
      setBrokerAccounts(accRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Connect OANDA</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your API credentials to connect your trading account.</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-4">{success}</div>}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Environment</label>
            <div className="flex gap-3">
              {['demo', 'live'].map(env => (
                <button key={env} type="button"
                  onClick={() => setForm({ ...form, environment: env })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                    form.environment === env
                      ? env === 'live'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border'
                        : 'bg-blue-500/20 border-blue-500/50 text-blue-400 border'
                      : 'bg-white/5 border border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >{env}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">API Token</label>
            <input type="password" required value={form.api_token}
              onChange={e => setForm({ ...form, api_token: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="Enter your OANDA API token" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account ID</label>
            <input type="text" required value={form.account_id}
              onChange={e => setForm({ ...form, account_id: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="e.g. 101-001-12345678-001" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
            {loading ? 'Connecting...' : 'Connect Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
