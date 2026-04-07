import React, { useEffect } from 'react';
import { TopBar } from './TopBar';
import { CommandBar } from './CommandBar';
import { CommandOutput } from './CommandOutput';
import { GridLayout } from './GridLayout';
import { PriceSync } from './PriceSync';
import { ToastManager } from '../common/ToastManager';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { brokerAPI } from '../../services/api';
import { useBroker } from '../../store/BrokerContext';

export function TerminalShell() {
  const { setConnection, addLog, togglePanel } = useTerminalStore();
  const ws = useWebSocket();
  const { activeBrokerAccount } = useBroker();

  // API Health check
  useEffect(() => {
    const check = async () => {
      setConnection({ api: 'checking' });
      try {
        const res = await fetch('http://localhost:8000/health');
        const data = await res.json();
        setConnection({
          api: data.status === 'healthy' ? 'online' : 'offline',
          lastCheck: new Date().toISOString(),
        });
      } catch {
        setConnection({ api: 'offline', lastCheck: new Date().toISOString() });
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [setConnection]);

  // WebSocket connect
  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const input = document.querySelector('[data-command-input]');
        if (input) input.focus();
      }

      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'w') { e.preventDefault(); togglePanel('watchlist'); }
        if (key === 'c') { e.preventDefault(); togglePanel('chart'); }
        if (key === 'o') { e.preventDefault(); togglePanel('orderTicket'); }
        if (key === 'p') { e.preventDefault(); togglePanel('positions'); }
        if (key === 't') { e.preventDefault(); togglePanel('tradebook'); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePanel]);

  // Log on mount
  useEffect(() => {
    addLog('system', 'FX-Master Terminal initialized');
    if (activeBrokerAccount) {
      addLog('system', `Broker connected: OANDA (${activeBrokerAccount.account_id || activeBrokerAccount.broker_account_id})`);
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full flex-1 bg-[#08080d] text-zinc-200 overflow-hidden">
      <PriceSync />
      <TopBar />
      <div className="flex-1 overflow-hidden">
        <GridLayout />
      </div>
      <CommandOutput />
      <CommandBar />
      <ToastManager />
    </div>
  );
}
