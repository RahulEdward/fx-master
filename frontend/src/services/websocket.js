/**
 * FX-Master WebSocket Service
 * Manages live price streaming via WebSocket.
 */

class PriceWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // instrument -> Set<callback>
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.isConnecting = false;
  }

  connect(instruments = ['EUR_USD']) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;

    const instStr = instruments.join(',');
    const url = `ws://localhost:8000/ws/prices?instruments=${instStr}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WS] Connected to price stream');
      this.isConnecting = false;
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const instrument = data.instrument;
        const callbacks = this.listeners.get(instrument);
        if (callbacks) {
          callbacks.forEach((cb) => cb(data));
        }
        // Also notify "all" listeners
        const allCbs = this.listeners.get('*');
        if (allCbs) {
          allCbs.forEach((cb) => cb(data));
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting...');
      this.isConnecting = false;
      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.connect(instruments);
      }, this.reconnectDelay);
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      this.ws.close();
    };
  }

  subscribe(instrument, callback) {
    if (!this.listeners.has(instrument)) {
      this.listeners.set(instrument, new Set());
    }
    this.listeners.get(instrument).add(callback);

    // Send subscribe message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', instruments: [instrument] }));
    }

    // Return unsubscribe function
    return () => {
      const cbs = this.listeners.get(instrument);
      if (cbs) {
        cbs.delete(callback);
        if (cbs.size === 0) this.listeners.delete(instrument);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const priceWS = new PriceWebSocket();
