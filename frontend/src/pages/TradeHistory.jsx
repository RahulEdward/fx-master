import React, { useEffect, useState } from 'react';
import { useBroker } from '../store/BrokerContext';
import { tradingAPI } from '../services/api';

export default function TradeHistory() {
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accId) return;
    loadTransactions();
  }, [accId]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const res = await tradingAPI.getTransactions(accId, 100);
      setTransactions(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (!accId) return <div className="text-gray-500 text-center py-20">Connect a broker to view trade history.</div>;
  if (loading) return <div className="text-gray-500 text-center py-20 animate-pulse">Loading transactions...</div>;

  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-600 text-sm">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-xs uppercase border-b border-white/5">
              <th className="text-left pb-2 pr-4">ID</th>
              <th className="text-left pb-2 pr-4">Type</th>
              <th className="text-left pb-2 pr-4">Instrument</th>
              <th className="text-right pb-2 pr-4">Units</th>
              <th className="text-right pb-2 pr-4">Price</th>
              <th className="text-right pb-2 pr-4">P/L</th>
              <th className="text-right pb-2">Time</th>
            </tr></thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.transaction_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-4 text-gray-600 font-mono text-xs">{tx.transaction_id}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      tx.type === 'ORDER_FILL' ? 'bg-blue-500/10 text-blue-400' :
                      tx.type?.includes('STOP_LOSS') ? 'bg-red-500/10 text-red-400' :
                      tx.type?.includes('TAKE_PROFIT') ? 'bg-green-500/10 text-green-400' :
                      'bg-white/5 text-gray-400'
                    }`}>{tx.type}</span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-white">{tx.instrument || '—'}</td>
                  <td className="py-2 pr-4 text-right font-mono text-gray-400">{tx.units || '—'}</td>
                  <td className="py-2 pr-4 text-right font-mono text-gray-400">{tx.price || '—'}</td>
                  <td className={`py-2 pr-4 text-right font-mono ${(tx.pl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.pl ? `$${tx.pl.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 text-right text-gray-600 text-xs">{tx.time ? new Date(tx.time).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
