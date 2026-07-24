# ST LABS COCKPIT v7.0

Dashboard de trading en tiempo real tipo cabina de control. Construido con React + TypeScript + Vite.

## Demo

```bash
npm install
npm run dev
```

## Features

- **Dashboard full-screen** con layout tipo cockpit
- **4 tipos de gráfico**: Line, Area, Candlestick, Bars
- **7 activos**: EUR/USD, XAU/USD, NASDAQ 100, BTC/USD, DJ30, ETH/USD, GBP/USD
- **5 confluencias** con LED indicators
- **Datos reales** vía Binance WebSocket (modo LIVE)
- **Simulación** de precios en tiempo real (modo SIMULATION)
- **Panel de estrategias**: Scalping 1M, Swing H4, Breakout M15
- **Gestión de portafolio**: Balance, equity, margin, PNL
- **Configuración de comunicación** con API StreetTraders
- **Order management**: BUY/SELL con TP/SL automáticos
- **Marca de agua** ST LABS en el fondo
- **Reloj** con zona horaria local + mercado activo

## Stack

- React 19
- TypeScript
- Vite
- Canvas API (charts)
- WebSocket (Binance)

## Estructura

```
src/
├── types/trading.ts        # Tipos del dominio
├── config/assets.ts        # Configuración de activos y estrategias
├── context/TradingContext.tsx # Estado global + reducer
├── hooks/
│   ├── usePriceEngine.ts   # Motor de precios (simulación + Binance)
│   ├── useBinancePrices.ts # WebSocket Binance
│   └── useMarketClock.ts   # Reloj de mercado
├── components/
│   ├── TopBar.tsx          # Barra superior: logo, sesión, reloj
│   ├── NavBar.tsx          # Navegación entre vistas
│   ├── PriceDisplay.tsx    # Precio + gráfico multi-tipo
│   ├── OrderPanel.tsx      # Order management + ticket activo
│   ├── ConfluenceSemaphor.tsx # LEDs de confluencia
│   ├── AssetSelector.tsx   # Selector de activos
│   ├── MarketIndicators.tsx# Telemetry de mercado
│   ├── StrategyManager.tsx # Gestión de estrategias
│   ├── PortfolioPanel.tsx  # Panel de portafolio
│   └── CommSettings.tsx    # Configuración API/WS
└── index.css               # Estilos globales
```
