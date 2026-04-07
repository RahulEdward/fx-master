import React, { useState, useRef, useEffect } from 'react';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { Terminal, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { cmd: '/watchlist', desc: 'Toggle watchlist panel' },
  { cmd: '/chart', desc: 'Toggle chart panel' },
  { cmd: '/order', desc: 'Toggle order ticket' },
  { cmd: '/positions', desc: 'Toggle positions panel' },
  { cmd: '/funds', desc: 'Toggle account panel' },
  { cmd: '/trades', desc: 'Toggle trade history' },
  { cmd: '/edit', desc: 'Toggle layout edit mode' },
  { cmd: '/connect', desc: 'Connect OANDA broker account' },
  { cmd: '/clear', desc: 'Clear terminal logs' },
  { cmd: '/pair [SYMBOL]', desc: 'Set active symbol (e.g., /pair EUR_USD)' },
];

export function CommandBar() {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { togglePanel, setEditMode, isEditMode, clearLogs, setSelectedSymbol, addLog, setShowCommandOutput } = useTerminalStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (value.startsWith('/')) {
      const filtered = COMMANDS.filter(c => c.cmd.startsWith(value.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  const executeCommand = (cmd) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const command = parts[0];
    const arg = parts[1];

    switch (command) {
      case '/watchlist': togglePanel('watchlist'); break;
      case '/chart': togglePanel('chart'); break;
      case '/order': togglePanel('orderTicket'); break;
      case '/positions': togglePanel('positions'); break;
      case '/funds': togglePanel('funds'); break;
      case '/trades': togglePanel('tradebook'); break;
      case '/edit': setEditMode(!isEditMode); break;
      case '/connect': navigate('/connect'); break;
      case '/clear': clearLogs(); break;
      case '/pair':
        if (arg) {
          setSelectedSymbol(arg.toUpperCase());
          addLog('system', `Active pair set to ${arg.toUpperCase()}`);
        }
        break;
      default:
        addLog('error', `Unknown command: ${command}`);
        setShowCommandOutput(true);
    }
    setValue('');
    inputRef.current?.blur();
  };

  return (
    <div className="h-8 bg-[#0a0a12] border-t border-[#1e1e30] flex items-center px-3 shrink-0">
      <Terminal size={12} className="text-emerald-500 mr-2 shrink-0" />
      <span className="text-emerald-500 text-[11px] font-mono mr-1 shrink-0">$</span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          data-command-input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) executeCommand(value);
            if (e.key === 'Escape') { setValue(''); inputRef.current?.blur(); }
          }}
          className="w-full bg-transparent text-[11px] text-zinc-300 font-mono outline-none placeholder:text-zinc-700"
          placeholder="Type / for commands, Ctrl+K to focus..."
        />
        {/* Suggestions */}
        {suggestions.length > 0 && value && (
          <div className="absolute bottom-full left-0 mb-1 bg-[#0e0e18] border border-[#1e1e30] rounded shadow-xl z-50 min-w-[250px] py-1">
            {suggestions.map(s => (
              <button key={s.cmd} onClick={() => executeCommand(s.cmd)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#1e1e30] flex items-center justify-between gap-4"
              >
                <span className="text-[10px] font-mono text-emerald-400">{s.cmd}</span>
                <span className="text-[9px] text-zinc-600">{s.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => useTerminalStore.getState().setShowCommandOutput(v => !v)}
        className="ml-2 p-1 hover:bg-[#1e1e30] rounded transition-colors" title="Toggle logs">
        <Search size={11} className="text-zinc-600" />
      </button>
    </div>
  );
}
