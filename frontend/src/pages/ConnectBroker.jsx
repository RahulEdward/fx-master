import React, { useState, useEffect } from 'react';
import { brokerAPI } from '../services/api';
import { useBroker } from '../store/BrokerContext';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { CommandBar } from '../components/layout/CommandBar';

export default function ConnectBroker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBrokerAccount, setActiveBrokerAccount, brokerAccounts, fetchAccounts, loadingAccounts } = useBroker();
  const [form, setForm] = useState({ api_token: '', account_id: '', environment: 'demo' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);

  // Show form by default if no saved accounts
  useEffect(() => {
    if (!loadingAccounts && brokerAccounts.length === 0) {
      setShowAddForm(true);
    }
  }, [loadingAccounts, brokerAccounts]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await brokerAPI.connect(form);
      setSuccess(`Connected! Balance: ${res.data.balance} ${res.data.currency}`);
      setActiveBrokerAccount(res.data);
      // Refresh the accounts list to get the saved card
      await fetchAccounts();
      // Reset form & hide it
      setForm({ api_token: '', account_id: '', environment: 'demo' });
      setTimeout(() => {
        setShowAddForm(false);
        navigate('/terminal');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async (account) => {
    setConnectingId(account.id);
    setError('');
    try {
      // Re-connect using the stored credentials (backend handles decryption)
      const res = await brokerAPI.getAccountSummary(account.id);
      setActiveBrokerAccount({ ...account, ...res.data, broker_account_id: account.id });
      setSuccess(`Reconnected to ${account.account_id}`);
      await fetchAccounts();
      setTimeout(() => navigate('/terminal'), 1200);
    } catch (err) {
      setError(`Failed to reconnect: ${err.message}`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (account) => {
    setDisconnectingId(account.id);
    try {
      await brokerAPI.disconnect(account.id);
      if (activeBrokerAccount?.id === account.id || activeBrokerAccount?.broker_account_id === account.id) {
        setActiveBrokerAccount(null);
      }
      await fetchAccounts();
      setSuccess('Account disconnected');
    } catch (err) {
      setError(err.message);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleRemove = async (account) => {
    setDisconnectingId(account.id);
    try {
      if (!window.confirm(`Are you sure you want to remove the OANDA account ${account.account_id}?`)) return;
      await brokerAPI.removeAccount(account.id);
      if (activeBrokerAccount?.id === account.id || activeBrokerAccount?.broker_account_id === account.id) {
        setActiveBrokerAccount(null);
      }
      await fetchAccounts();
      setSuccess('Account successfully removed');
    } catch (err) {
      setError(err.message);
    } finally {
      setDisconnectingId(null);
    }
  };

  const isActive = (account) => {
    return activeBrokerAccount?.id === account.id || 
           activeBrokerAccount?.broker_account_id === account.id;
  };

  const formatCurrency = (val, currency = 'USD') => {
    if (val == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  };

  return (
    <div className="flex flex-col h-full w-full flex-1 bg-[#08080d] text-zinc-200 overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Broker Connections</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your OANDA trading accounts</p>
            </div>
            {brokerAccounts.length > 0 && (
              <button
                onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess(''); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  showAddForm
                    ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {showAddForm ? '✕ Cancel' : '+ Add Account'}
              </button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <span className="text-lg">✅</span>
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400/60 hover:text-emerald-400">✕</button>
            </div>
          )}

          {/* Saved Account Cards */}
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Loading saved accounts...</span>
            </div>
          ) : brokerAccounts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Saved Accounts ({brokerAccounts.length})
              </h2>
              <div className="grid gap-4">
                {brokerAccounts.map(account => (
                  <div
                    key={account.id}
                    className={`relative group rounded-2xl border p-5 transition-all duration-300 ${
                      isActive(account)
                        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'bg-[#0d1117] border-white/10 hover:border-white/20 hover:bg-[#0f1419]'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive(account) && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Broker Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive(account)
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}>
                        <span className="text-xl">🏦</span>
                      </div>

                      {/* Account Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm">OANDA</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            account.environment === 'live'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}>
                            {account.environment}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs font-mono truncate">{account.account_id}</p>
                        {account.alias && <p className="text-gray-600 text-xs mt-0.5">{account.alias}</p>}

                        {/* Balance Info */}
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Balance</p>
                            <p className="text-white font-semibold text-sm">
                              {formatCurrency(account.balance, account.currency)}
                            </p>
                          </div>
                          {account.unrealized_pl != null && (
                            <div>
                              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Unrealized P&L</p>
                              <p className={`font-semibold text-sm ${
                                Number(account.unrealized_pl) >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(account.unrealized_pl, account.currency)}
                              </p>
                            </div>
                          )}
                          {account.margin_available != null && (
                            <div>
                              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Margin Available</p>
                              <p className="text-gray-300 font-semibold text-sm">
                                {formatCurrency(account.margin_available, account.currency)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      {isActive(account) ? (
                        <>
                          <div className="flex-1 text-xs text-emerald-400/80 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Connected & Active
                          </div>
                          <button
                            onClick={() => handleDisconnect(account)}
                            disabled={disconnectingId === account.id}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            {disconnectingId === account.id ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReconnect(account)}
                            disabled={connectingId === account.id}
                            className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {connectingId === account.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <span>⚡</span>
                                Quick Connect
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRemove(account)}
                            disabled={disconnectingId === account.id}
                            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50"
                          >
                            {disconnectingId === account.id ? '...' : '🗑️'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Account Form */}
          {showAddForm && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {brokerAccounts.length > 0 ? 'Add New Account' : 'Connect OANDA'}
                    </h2>
                    <p className="text-gray-500 text-xs">Your credentials are encrypted and stored securely.</p>
                  </div>
                </div>

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

                  {/* Info Note */}
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex items-start gap-2">
                    <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
                    <p className="text-[11px] text-blue-300/70 leading-relaxed">
                      Your API token will be <strong className="text-blue-300">encrypted</strong> and saved securely. 
                      Next time you can reconnect with a single click from the saved card.
                    </p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving & Connecting...
                      </>
                    ) : (
                      <>
                        <span>🔐</span>
                        Save & Connect
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingAccounts && brokerAccounts.length === 0 && !showAddForm && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-3xl">🏦</span>
              </div>
              <h3 className="text-white font-semibold">No Accounts Connected</h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                Connect your OANDA broker account to start trading.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                + Connect OANDA Account
              </button>
            </div>
          )}
        </div>
      </div>
      <CommandBar />
    </div>
  );
}
