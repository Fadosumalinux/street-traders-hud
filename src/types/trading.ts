export interface AssetConfig {
  symbol: string;
  label: string;
  base: number;
  decimals: number;
  multiplier: number;
  pipValue: number;
  binancePair?: string;
  category: 'forex' | 'crypto' | 'indices' | 'metals';
}

export interface ConfluenceIndicator {
  id: string;
  label: string;
  active: boolean;
}

export interface TradeOrder {
  id: string;
  type: 'BUY' | 'SELL';
  asset: string;
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  tp: number;
  sl: number;
  timestamp: number;
}

export interface Strategy {
  id: string;
  name: string;
  indicators: string[];
  tpRatio: number;
  slRatio: number;
  maxLot: number;
  confluencesRequired: number;
}

export interface Portfolio {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  openPositions: number;
  totalPnl: number;
}

export interface CommConfig {
  mode: 'simulation' | 'live';
  apiUrl: string;
  wsUrl: string;
  apiKey: string;
  connected: boolean;
}

export interface MarketData {
  price: number;
  bid: number;
  ask: number;
  spread: number;
  volume24h: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
}

export type DashboardView = 'cockpit' | 'strategy' | 'portfolio' | 'settings';
export type ChartType = 'line' | 'area' | 'candlestick' | 'bars';

export interface TradingState {
  activeAsset: string;
  lotSize: number;
  isActive: boolean;
  orderType: 'BUY' | 'SELL' | null;
  entryPrice: number;
  currentPnl: number;
  tp: number;
  sl: number;
  confluences: ConfluenceIndicator[];
  balance: number;
  priceHistory: number[];
  sentiment: 'ALCISTA' | 'BAJISTA' | 'NEUTRAL';
  session: string;
  viewMode: number;
  currentView: DashboardView;
  activeStrategy: Strategy | null;
  portfolio: Portfolio;
  commConfig: CommConfig;
  chartType: ChartType;
}
