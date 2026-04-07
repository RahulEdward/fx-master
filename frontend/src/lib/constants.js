/**
 * FX-Master Constants
 */

export const FOREX_PAIRS = [
  { symbol: 'EUR_USD', display: 'EUR/USD', pip: 0.0001 },
  { symbol: 'GBP_USD', display: 'GBP/USD', pip: 0.0001 },
  { symbol: 'USD_JPY', display: 'USD/JPY', pip: 0.01 },
  { symbol: 'AUD_USD', display: 'AUD/USD', pip: 0.0001 },
  { symbol: 'USD_CAD', display: 'USD/CAD', pip: 0.0001 },
  { symbol: 'NZD_USD', display: 'NZD/USD', pip: 0.0001 },
  { symbol: 'EUR_GBP', display: 'EUR/GBP', pip: 0.0001 },
  { symbol: 'EUR_JPY', display: 'EUR/JPY', pip: 0.01 },
  { symbol: 'GBP_JPY', display: 'GBP/JPY', pip: 0.01 },
  { symbol: 'AUD_JPY', display: 'AUD/JPY', pip: 0.01 },
  { symbol: 'USD_CHF', display: 'USD/CHF', pip: 0.0001 },
  { symbol: 'EUR_CHF', display: 'EUR/CHF', pip: 0.0001 },
  { symbol: 'XAU_USD', display: 'XAU/USD', pip: 0.01 },
  { symbol: 'XAG_USD', display: 'XAG/USD', pip: 0.001 },
];

export const TIMEFRAMES = [
  { label: '1m', value: 'M1' },
  { label: '5m', value: 'M5' },
  { label: '15m', value: 'M15' },
  { label: '30m', value: 'M30' },
  { label: '1H', value: 'H1' },
  { label: '4H', value: 'H4' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

export const ORDER_TYPES = ['MARKET', 'LIMIT', 'STOP'];
export const ORDER_SIDES = ['BUY', 'SELL'];

export const DEFAULT_PANELS = [
  { id: 'watchlist', title: 'Watchlist', visible: true, minimized: false },
  { id: 'chart', title: 'Chart', visible: true, minimized: false },
  { id: 'orderTicket', title: 'Order Ticket', visible: true, minimized: false },
  { id: 'positions', title: 'Positions', visible: true, minimized: false },
  { id: 'funds', title: 'Account', visible: true, minimized: false },
  { id: 'tradebook', title: 'Trade History', visible: false, minimized: false },
  { id: 'alerts', title: 'Alerts', visible: false, minimized: false },
  { id: 'marketDepth', title: 'Level 2 DOM', visible: false, minimized: false },
];

export const DEFAULT_LAYOUT = [
  { i: 'watchlist',   x: 0,  y: 0,  w: 4,  h: 18, minW: 3, minH: 10 },
  { i: 'chart',       x: 4,  y: 0,  w: 14, h: 12, minW: 8, minH: 8 },
  { i: 'positions',   x: 4,  y: 12, w: 14, h: 6,  minW: 8, minH: 4 },
  { i: 'orderTicket', x: 18, y: 0,  w: 6,  h: 9,  minW: 4, minH: 6 },
  { i: 'funds',       x: 18, y: 9,  w: 6,  h: 5,  minW: 4, minH: 3 },
  { i: 'tradebook',   x: 4,  y: 12, w: 14, h: 6,  minW: 8, minH: 4 },
  { i: 'alerts',      x: 18, y: 14, w: 6,  h: 4,  minW: 4, minH: 3 },
];
