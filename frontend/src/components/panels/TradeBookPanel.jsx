import React, { useEffect, useState } from 'react';
import { useBroker } from '../../store/BrokerContext';
import { tradingAPI } from '../../services/api';
import { RefreshCw } from 'lucide-react';

export function TradeBookPanel() {
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!accId) return;
    setLoading(true);
    try {
      const res = await tradingAPI.getTransactions(accId, 50);
      setTransactions(res.data?.transactions || res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [accId]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a12]">
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#1e1e30]">
        <span className="text-[10px] text-zinc-500">{transactions.length} transactions</span>
        <button onClick={load} disabled={loading} className="p-1 hover:bg-[#1e1e30] rounded transition-colors">
          <RefreshCw size={10} className={`text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center px-2 py-1 text-[8px] font-bold text-zinc-600 uppercase tracking-wider border-b border-[#1e1e30] bg-[#0e0e18]">
        <span className="w-16">Time</span>
        <span className="w-12">Type</span>
        <span className="w-20">Pair</span>
        <span className="w-16 text-right">Units</span>
        <span className="w-20 text-right">Price</span>
        <span className="flex-1 text-right">P&L</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] text-zinc-700">No trade history</span>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id || i} className="flex items-center px-2 py-1.5 border-b border-[#1e1e30]/50 hover:bg-[#1e1e30]/30 text-[10px]">
              <span className="w-16 text-zinc-600 font-mono">
                {tx.time ? new Date(tx.time).toLocaleTimeString() : '—'}
              </span>
              <span className="w-12 text-zinc-500 uppercase text-[9px] font-bold">
                {tx.type?.replace('ORDER_', '').substring(0, 6) || '—'}
              </span>
              <span className="w-20 text-zinc-300 font-bold">
                {(tx.instrument || '').replace('_', '/')}
              </span>
              <span className="w-16 text-right text-zinc-400 font-mono">
                {tx.units || '—'}
              </span>
              <span className="w-20 text-right text-zinc-500 font-mono">
                {tx.price ? Number(tx.price).toFixed(5) : '—'}
              </span>
              <span className={`flex-1 text-right font-bold ${
                Number(tx.pl) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {tx.pl ? (Number(tx.pl) >= 0 ? '+' : '') + Number(tx.pl).toFixed(2) : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
