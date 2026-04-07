import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { useTerminalStore } from '../../hooks/useTerminalStore';
import { marketAPI } from '../../services/api';
import { useBroker } from '../../store/BrokerContext';
import { TIMEFRAMES, FOREX_PAIRS } from '../../lib/constants';

export function ChartPanel() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const { selectedSymbol, chartSettings, setChartSettings, prices } = useTerminalStore();
  const { activeBrokerAccount } = useBroker();
  const [loading, setLoading] = useState(false);
  const [ohlc, setOhlc] = useState(null);

  const accId = activeBrokerAccount?.broker_account_id || activeBrokerAccount?.id;

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#08080d' },
        textColor: '#71717a',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#1e1e30' },
        horzLines: { color: '#1e1e30' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: '#1e1e30',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#1e1e30',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Crosshair move → show OHLC legend
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setOhlc(null);
        return;
      }
      const candle = param.seriesData.get(series);
      if (candle) {
        setOhlc({ open: candle.open, high: candle.high, low: candle.low, close: candle.close, time: param.time });
      } else {
        setOhlc(null);
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Load candle data
  useEffect(() => {
    if (!accId || !selectedSymbol) return;

    const loadCandles = async () => {
      setLoading(true);
      lastCandleRef.current = null;
      try {
        // Smart candle count per timeframe
        const countMap = {
          M1: 300, M5: 500, M15: 500, M30: 500,
          H1: 500, H4: 500, D: 500, W: 260, M: 120,
        };
        const count = countMap[chartSettings.timeframe] || 500;
        const res = await marketAPI.getCandles(accId, selectedSymbol, chartSettings.timeframe, count);
        const raw = (res.data?.candles || res.data || []).map(c => ({
          time: Math.floor(new Date(c.time || c.timestamp).getTime() / 1000),
          open: parseFloat(c.mid?.o || c.open),
          high: parseFloat(c.mid?.h || c.high),
          low: parseFloat(c.mid?.l || c.low),
          close: parseFloat(c.mid?.c || c.close),
        })).filter(c => !isNaN(c.time) && c.time > 0);

        // Sort by time and deduplicate
        raw.sort((a, b) => a.time - b.time);
        const candles = [];
        for (const c of raw) {
          if (candles.length === 0 || c.time > candles[candles.length - 1].time) {
            candles.push(c);
          }
        }

        if (seriesRef.current && candles.length > 0) {
          seriesRef.current.setData(candles);
          lastCandleRef.current = candles[candles.length - 1];
          chartRef.current?.timeScale().fitContent();
        }
      } catch (e) {
        console.error('Failed to load candles:', e);
      } finally {
        setLoading(false);
      }
    };

    loadCandles();
  }, [accId, selectedSymbol, chartSettings.timeframe]);

  // Update last candle with live price
  const lastCandleRef = useRef(null);
  useEffect(() => {
    const tick = prices[selectedSymbol];
    if (!tick || !seriesRef.current) return;

    const price = parseFloat(tick.bid);
    if (isNaN(price)) return;

    // Align time to current timeframe bucket
    const tfSeconds = {
      M1: 60, M5: 300, M15: 900, M30: 1800,
      H1: 3600, H4: 14400, D: 86400, W: 604800, M: 2592000,
    };
    const interval = tfSeconds[chartSettings.timeframe] || 300;
    const now = Math.floor(Date.now() / 1000);
    let candleTime = Math.floor(now / interval) * interval;

    // Ensure candleTime is never before the last known candle
    const last = lastCandleRef.current;
    if (last && candleTime < last.time) {
      candleTime = last.time;
    }
    if (last && last.time === candleTime) {
      // Update existing candle
      const updated = {
        time: candleTime,
        open: last.open,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        close: price,
      };
      lastCandleRef.current = updated;
      seriesRef.current.update(updated);
    } else {
      // New candle
      const newCandle = { time: candleTime, open: price, high: price, low: price, close: price };
      lastCandleRef.current = newCandle;
      seriesRef.current.update(newCandle);
    }
  }, [prices[selectedSymbol], chartSettings.timeframe]);

  const pair = FOREX_PAIRS.find(p => p.symbol === selectedSymbol);
  const decimals = pair?.pip === 0.01 ? 3 : 5;

  return (
    <div className="h-full flex flex-col bg-[#08080d]">
      {/* Chart Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[#1e1e30] shrink-0">
        <span className="text-[11px] font-bold text-white mr-2">{pair?.display || selectedSymbol}</span>

        {/* Timeframes */}
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => setChartSettings({ timeframe: tf.value })}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
                chartSettings.timeframe === tf.value
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-[#1e1e30]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="ml-auto flex items-center gap-1">
            <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] text-zinc-600">Loading...</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="flex-1 relative">
        {/* OHLC Legend Overlay */}
        {ohlc && (
          <div className="absolute top-1 left-2 z-10 flex items-center gap-3 pointer-events-none">
            <span className="text-[10px] font-mono text-zinc-500">
              O <span className={ohlc.close >= ohlc.open ? 'text-emerald-400' : 'text-red-400'}>{ohlc.open.toFixed(decimals)}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              H <span className={ohlc.close >= ohlc.open ? 'text-emerald-400' : 'text-red-400'}>{ohlc.high.toFixed(decimals)}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              L <span className={ohlc.close >= ohlc.open ? 'text-emerald-400' : 'text-red-400'}>{ohlc.low.toFixed(decimals)}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              C <span className={ohlc.close >= ohlc.open ? 'text-emerald-400' : 'text-red-400'}>{ohlc.close.toFixed(decimals)}</span>
            </span>
          </div>
        )}
      </div>

      {/* No broker message */}
      {!accId && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#08080d]/90">
          <div className="text-center">
            <p className="text-zinc-500 text-xs">Connect a broker to load chart data</p>
          </div>
        </div>
      )}
    </div>
  );
}
