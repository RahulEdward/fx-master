import { useEffect, useRef, useMemo } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { marketAPI } from '../../services/api';
import { useBroker } from '../../store/BrokerContext';

/**
 * Invisible component that manages WebSocket subscriptions based on watchlist changes,
 * along with a polling fallback for live prices.
 */
export function PriceSync() {
  const watchlists = useTerminalStore(s => s.watchlists) || {};
  const updatePrice = useTerminalStore(s => s.updatePrice);
  const { subscribe } = useWebSocket();
  const prevWatchlist = useRef([]);
  const { activeBrokerAccount } = useBroker();
  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;

  // Stable symbol list — only changes when watchlists actually change
  const symbolsKey = JSON.stringify(watchlists);
  const allSymbols = useMemo(() => {
    const vals = Object.values(watchlists).filter(Array.isArray).flat();
    return [...new Set(vals)];
  }, [symbolsKey]);

  // 1. WebSocket sync
  useEffect(() => {
    const newSymbols = allSymbols.filter(s => !prevWatchlist.current.includes(s));
    if (newSymbols.length > 0) {
      subscribe(newSymbols);
    }
    prevWatchlist.current = allSymbols;
  }, [allSymbols, subscribe]);

  // 2. HTTP Polling Fallback (ensures data arrives even if Redis/WS fails locally)
  useEffect(() => {
    if (!accId || allSymbols.length === 0) return;

    let active = true;

    const fetchLivePrices = async () => {
      try {
        const res = await marketAPI.getPrices(accId, allSymbols.join(','));
        if (!active) return;
        const data = res.data || [];
        data.forEach(tick => {
          if (tick.instrument) {
            updatePrice(tick.instrument, {
              bid: parseFloat(tick.bid) || tick.bid,
              ask: parseFloat(tick.ask) || tick.ask,
              spread: tick.spread,
              time: tick.time,
              bids: tick.bids || [],
              asks: tick.asks || [],
            });
          }
        });
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [accId, allSymbols, updatePrice]);

  return null;
}
