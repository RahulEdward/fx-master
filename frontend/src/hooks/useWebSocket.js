/**
 * WebSocket hook for live price streaming
 */
import { useRef, useCallback } from 'react';
import { useTerminalStore } from './useTerminalStore';

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const updatePrice = useTerminalStore(s => s.updatePrice);
  const setConnection = useTerminalStore(s => s.setConnection);
  const addLog = useTerminalStore(s => s.addLog);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const state = useTerminalStore.getState();
    const watchlists = state.watchlists || {};
    const allSymbols = [...new Set(Object.values(watchlists).filter(Array.isArray).flat())];
    const instruments = allSymbols.length > 0 ? allSymbols.join(',') : 'EUR_USD';
    const url = `ws://localhost:8000/ws/prices?instruments=${instruments}`;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setConnection({ ws: 'connected' });
        addLog('system', 'WebSocket connected — streaming live prices');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.instrument) {
            updatePrice(data.instrument, {
              bid: parseFloat(data.bid),
              ask: parseFloat(data.ask),
              spread: parseFloat(data.ask) - parseFloat(data.bid),
              time: data.time,
            });
          }
        } catch (e) { /* ignore parse errors */ }
      };

      wsRef.current.onclose = () => {
        setConnection({ ws: 'disconnected' });
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(() => connect(), 3000);
      };

      wsRef.current.onerror = () => {
        setConnection({ ws: 'error' });
        wsRef.current?.close();
      };
    } catch (e) {
      setConnection({ ws: 'error' });
    }
  }, [updatePrice, setConnection, addLog]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const subscribe = useCallback((symbols) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe', instruments: symbols }));
    }
  }, []);

  return { connect, disconnect, subscribe };
}
