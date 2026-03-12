<p align="center">
  <img src="assets/logo.png" alt="FX-Master Logo" width="120" height="120" style="border-radius: 20px;" />
</p>

<h1 align="center">FX-Master</h1>

<p align="center">
  <strong>Institutional-Grade Forex Trading SaaS Platform</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/broker-OANDA-blue?style=flat-square" alt="OANDA" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/frontend-React%2019-61DAFB?style=flat-square&logo=react" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/cache-Redis-DC382D?style=flat-square&logo=redis" alt="Redis" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  A production-ready, modular forex trading platform with real-time market data streaming, multi-broker support architecture, and comprehensive risk management — built for traders who demand performance.
</p>

---

## ✨ Features

| Category | Capabilities |
|---|---|
| **🔗 Broker Integration** | OANDA v20 REST + Streaming API (Demo & Live) |
| **📊 Market Data** | Real-time prices, historical OHLCV candles (S5 to Monthly), multi-instrument pricing |
| **💹 Order Execution** | Market, Limit, Stop, Stop-Limit orders with TP/SL |
| **📈 Trade Management** | Open trades, partial/full close, modify TP/SL/trailing stop |
| **🏦 Account Management** | Multi-account support, live balance, margin, P&L tracking |
| **⚡ Live Streaming** | OANDA → Redis PubSub → WebSocket → React (sub-second latency) |
| **🛡️ Risk Management** | Position sizing, margin calculator, pre-trade risk assessment |
| **📜 Transaction History** | Full audit log with DB persistence |
| **🔐 Security** | JWT auth, bcrypt hashing, Fernet-encrypted broker credentials, rate limiting |
| **🏗️ Modular Architecture** | Broker adapter pattern — add new brokers without touching core logic |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Dashboard │  │  Orders  │  │ Positions│  │  History   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │             │              │          │
│       └──────────────┴──────┬──────┴──────────────┘          │
│                             │ HTTP / WebSocket               │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│                    FastAPI Backend                           │
│                             │                               │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │              Route Layer (API Endpoints)               │  │
│  │  auth_routes │ broker_routes │ market_routes │ trading │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │          Service Layer (Business Logic)                │  │
│  │  trading_engine │ market_data_service │ risk_service   │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │            Broker Adapter Layer                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐   │  │
│  │  │  OANDA  │  │  FXCM   │  │  Future Brokers...  │   │  │
│  │  │ (Active)│  │(Planned)│  │                     │   │  │
│  │  └─────────┘  └─────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  PostgreSQL    │  │     Redis      │  │  WebSocket   │  │
│  │  (Persistence) │  │  (PubSub/Cache)│  │  (Streaming) │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow — Live Price Streaming

```
OANDA Stream API ──→ pricing_stream.py ──→ Redis PubSub ──→ WebSocket Service ──→ /ws/prices ──→ React UI
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Uvicorn |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Database** | PostgreSQL 16 (async via SQLAlchemy + asyncpg) |
| **Cache/PubSub** | Redis 7 |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Encryption** | Fernet symmetric encryption (cryptography) |
| **HTTP Client** | httpx (async) |
| **Logging** | Loguru (structured, rotating file logs) |
| **Containerization** | Docker Compose |

---

## 📁 Project Structure

```
fx-master/
├── assets/
│   └── logo.png
│
├── backend/
│   ├── main.py                     # FastAPI application entry
│   ├── config.py                   # Pydantic settings
│   │
│   ├── database/
│   │   ├── connection.py           # Async SQLAlchemy engine
│   │   ├── init_db.py              # Table creation script
│   │   └── migrations.py           # Alembic placeholder
│   │
│   ├── models/                     # Broker-agnostic ORM models
│   │   ├── user.py
│   │   ├── broker_account.py
│   │   ├── order.py
│   │   ├── trade.py
│   │   ├── position.py
│   │   ├── transaction.py
│   │   └── market_data.py
│   │
│   ├── routes/                     # FastAPI route handlers
│   │   ├── auth_routes.py
│   │   ├── broker_routes.py
│   │   ├── market_routes.py
│   │   └── trading_routes.py
│   │
│   ├── services/                   # Business logic layer
│   │   ├── trading_engine.py
│   │   ├── market_data_service.py
│   │   ├── risk_service.py
│   │   └── websocket_service.py
│   │
│   ├── utils/
│   │   ├── security.py             # JWT, hashing, encryption
│   │   ├── logger.py               # Loguru config
│   │   └── helpers.py              # Utilities
│   │
│   └── broker/
│       └── oanda/                  # OANDA-specific implementation
│           ├── client.py           # Async HTTP client
│           ├── auth.py             # Token validation
│           ├── accounts.py         # Account management
│           ├── instruments.py      # Instrument metadata
│           ├── market_data.py      # Candles & pricing
│           ├── pricing_stream.py   # Live streaming → Redis
│           ├── orders.py           # Order execution
│           ├── trades.py           # Trade management
│           ├── positions.py        # Position tracking
│           ├── transactions.py     # Transaction history
│           ├── risk.py             # Risk calculations
│           ├── schemas.py          # Pydantic schemas
│           └── utils.py            # OANDA utilities
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── services/
│       │   ├── api.js              # HTTP API client
│       │   └── websocket.js        # WS price streaming
│       ├── store/
│       │   ├── AuthContext.jsx
│       │   └── BrokerContext.jsx
│       └── pages/
│           ├── ConnectBroker.jsx
│           ├── TradingDashboard.jsx
│           ├── OrderPanel.jsx
│           └── TradeHistory.jsx
│
├── docker-compose.yml              # PostgreSQL + Redis
├── requirements.txt
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- OANDA Demo/Live account ([Sign up free](https://www.oanda.com/))

### 1. Clone the repository

```bash
git clone https://github.com/RahulEdward/fx-master.git
cd fx-master
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

This spins up **PostgreSQL 16** and **Redis 7**.

### 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r ../requirements.txt

# Configure environment
copy .env.example .env       # Edit with your settings

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login → JWT tokens |
| `GET` | `/api/v1/auth/me` | Get current user profile |

### Broker Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/broker/oanda/connect` | Connect OANDA account |
| `GET` | `/api/v1/broker/oanda/accounts` | List connected accounts |
| `GET` | `/api/v1/broker/oanda/accounts/{id}/summary` | Live account summary |
| `GET` | `/api/v1/broker/oanda/accounts/{id}/instruments` | Tradable instruments |
| `DELETE` | `/api/v1/broker/oanda/accounts/{id}/disconnect` | Disconnect account |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/market/instruments` | List instruments |
| `GET` | `/api/v1/market/candles` | Historical OHLCV data |
| `GET` | `/api/v1/market/price` | Latest bid/ask price |
| `GET` | `/api/v1/market/spread` | Current spread |
| `GET` | `/api/v1/market/prices` | Multi-instrument pricing |

### Trading
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/trading/order` | Place an order |
| `GET` | `/api/v1/trading/trades` | List open trades |
| `PUT` | `/api/v1/trading/trades/{id}/close` | Close a trade |
| `PUT` | `/api/v1/trading/trades/{id}/modify` | Modify TP/SL |
| `GET` | `/api/v1/trading/positions` | List open positions |
| `PUT` | `/api/v1/trading/positions/{inst}/close` | Close a position |
| `GET` | `/api/v1/trading/transactions` | Transaction history |
| `POST` | `/api/v1/trading/risk/position-size` | Calculate position size |
| `GET` | `/api/v1/trading/risk/assessment` | Pre-trade risk check |

### WebSocket
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `WS` | `/ws/prices?instruments=EUR_USD,GBP_USD` | Live price stream |

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT access + refresh tokens |
| **Password Storage** | bcrypt hashing via passlib |
| **Broker Credentials** | Fernet symmetric encryption at rest |
| **API Protection** | Bearer token on all protected routes |
| **CORS** | Configurable allowed origins |
| **Rate Limiting** | Configurable per-minute limits |

---

## 🧩 Adding a New Broker

FX-Master uses a **broker adapter pattern**. To add a new broker:

1. Create a new directory under `backend/broker/<broker_name>/`
2. Implement the same module interface:
   - `client.py` — HTTP client
   - `auth.py` — Authentication
   - `accounts.py` — Account management
   - `orders.py` — Order execution
   - `trades.py` — Trade management
   - `positions.py` — Position tracking
3. Register in `services/trading_engine.py`
4. Add routes in `routes/broker_routes.py`

The **models, services, and routes** are designed to be broker-agnostic — no code changes needed in the common layer.

---

## 📊 Supported Timeframes

| Granularity | Description |
|-------------|-------------|
| `S5` | 5 seconds |
| `M1` | 1 minute |
| `M5` | 5 minutes |
| `M15` | 15 minutes |
| `M30` | 30 minutes |
| `H1` | 1 hour |
| `H4` | 4 hours |
| `D` | Daily |

---

## 🗺️ Roadmap

- [x] OANDA broker integration (REST + Streaming)
- [x] JWT authentication system
- [x] Real-time price streaming (WebSocket)
- [x] Order management (Market, Limit, Stop, Stop-Limit)
- [x] Risk management & position sizing
- [x] Transaction history & audit log
- [x] React trading dashboard
- [ ] TradingView charting integration
- [ ] Strategy builder & backtesting engine
- [ ] FXCM broker integration
- [ ] Interactive Brokers integration
- [ ] Mobile-responsive trading UI
- [ ] Telegram/Discord trade alerts
- [ ] Portfolio analytics & reporting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ⚡ by <a href="https://github.com/RahulEdward">Rahul Edward</a>
</p>
