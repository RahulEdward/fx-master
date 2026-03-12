/**
 * FX-Master API Service
 * Centralized HTTP client for all backend API calls.
 */

const API_BASE = 'http://localhost:8000/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body = null, params = null) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const options = { method, headers: getAuthHeaders() };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.message || 'API error');
  }
  return data;
}

// ---- Auth ----
export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  getMe: () => request('GET', '/auth/me'),
};

// ---- Broker ----
export const brokerAPI = {
  connect: (body) => request('POST', '/broker/oanda/connect', body),
  getAccounts: () => request('GET', '/broker/oanda/accounts'),
  getAccountSummary: (id) => request('GET', `/broker/oanda/accounts/${id}/summary`),
  getInstruments: (id) => request('GET', `/broker/oanda/accounts/${id}/instruments`),
  disconnect: (id) => request('DELETE', `/broker/oanda/accounts/${id}/disconnect`),
};

// ---- Market Data ----
export const marketAPI = {
  getInstruments: (brokerAccountId, type) =>
    request('GET', '/market/instruments', null, { broker_account_id: brokerAccountId, ...(type ? { instrument_type: type } : {}) }),
  getCandles: (brokerAccountId, instrument, granularity = 'M5', count = 200) =>
    request('GET', '/market/candles', null, { broker_account_id: brokerAccountId, instrument, granularity, count }),
  getPrice: (brokerAccountId, instrument) =>
    request('GET', '/market/price', null, { broker_account_id: brokerAccountId, instrument }),
  getSpread: (brokerAccountId, instrument) =>
    request('GET', '/market/spread', null, { broker_account_id: brokerAccountId, instrument }),
  getPrices: (brokerAccountId, instruments) =>
    request('GET', '/market/prices', null, { broker_account_id: brokerAccountId, instruments }),
};

// ---- Trading ----
export const tradingAPI = {
  placeOrder: (brokerAccountId, order) =>
    request('POST', '/trading/order', order, { broker_account_id: brokerAccountId }),
  getTrades: (brokerAccountId) =>
    request('GET', '/trading/trades', null, { broker_account_id: brokerAccountId }),
  closeTrade: (brokerAccountId, tradeId, body = {}) =>
    request('PUT', `/trading/trades/${tradeId}/close`, body, { broker_account_id: brokerAccountId }),
  modifyTrade: (brokerAccountId, tradeId, body) =>
    request('PUT', `/trading/trades/${tradeId}/modify`, body, { broker_account_id: brokerAccountId }),
  getPositions: (brokerAccountId) =>
    request('GET', '/trading/positions', null, { broker_account_id: brokerAccountId }),
  closePosition: (brokerAccountId, instrument, body) =>
    request('PUT', `/trading/positions/${instrument}/close`, body, { broker_account_id: brokerAccountId }),
  getTransactions: (brokerAccountId, count = 50) =>
    request('GET', '/trading/transactions', null, { broker_account_id: brokerAccountId, count }),
  calculatePositionSize: (body) =>
    request('POST', '/trading/risk/position-size', body),
  getRiskAssessment: (brokerAccountId, instrument, units) =>
    request('GET', '/trading/risk/assessment', null, { broker_account_id: brokerAccountId, instrument, units }),
};
