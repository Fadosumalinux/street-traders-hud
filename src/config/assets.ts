import type { AssetConfig } from '../types/trading';

export const ASSETS: Record<string, AssetConfig> = {
  'EUR/USD': {
    symbol: 'EUR/USD',
    label: 'EUR/USD | FOREX REVENUE',
    base: 1.0742,
    decimals: 5,
    multiplier: 100000,
    pipValue: 0.0010,
    binancePair: 'EURUSDT',
    category: 'forex',
  },
  'XAU/USD': {
    symbol: 'XAU/USD',
    label: 'XAU/USD | ST METALS',
    base: 2348.66,
    decimals: 2,
    multiplier: 100,
    pipValue: 2.50,
    category: 'metals',
  },
  'NASDAQ 100': {
    symbol: 'NASDAQ 100',
    label: 'NASDAQ | LIVE ENGINE',
    base: 18196.4,
    decimals: 1,
    multiplier: 10,
    pipValue: 20.0,
    binancePair: 'NASDAQ',
    category: 'indices',
  },
  'BTC/USD': {
    symbol: 'BTC/USD',
    label: 'BTC/USD | CRYPTO LIQUIDITY',
    base: 67240.5,
    decimals: 1,
    multiplier: 1,
    pipValue: 150.0,
    binancePair: 'BTCUSDT',
    category: 'crypto',
  },
  'DJ30': {
    symbol: 'DJ30',
    label: 'DJ30 | LIVE TELEMETRY',
    base: 39210.0,
    decimals: 1,
    multiplier: 10,
    pipValue: 35.0,
    category: 'indices',
  },
  'ETH/USD': {
    symbol: 'ETH/USD',
    label: 'ETH/USD | CRYPTO DEFI',
    base: 3542.80,
    decimals: 2,
    multiplier: 1,
    pipValue: 15.0,
    binancePair: 'ETHUSDT',
    category: 'crypto',
  },
  'GBP/USD': {
    symbol: 'GBP/USD',
    label: 'GBP/USD | FOREX STERLING',
    base: 1.2654,
    decimals: 5,
    multiplier: 100000,
    pipValue: 0.0010,
    binancePair: 'GBPUSDT',
    category: 'forex',
  },
};

export const DEFAULT_CONFLUENCES = [
  { id: 'ema', label: 'EMA CROSS', active: false },
  { id: 'rsi', label: 'RSI SIGNAL', active: false },
  { id: 'macd', label: 'MACD HIST', active: false },
  { id: 'volume', label: 'VOLUME SPK', active: false },
  { id: 'structure', label: 'STRUCTURE', active: false },
];

export const SESSIONS: Record<string, { name: string; hours: string }> = {
  sydney: { name: 'SYDNEY', hours: '22:00 - 07:00 UTC' },
  tokyo: { name: 'TOKYO', hours: '00:00 - 09:00 UTC' },
  london: { name: 'LONDON', hours: '08:00 - 17:00 UTC' },
  newyork: { name: 'NEW YORK', hours: '13:00 - 22:00 UTC' },
};

export function detectSession(): string {
  const now = new Date();
  const utcHour = now.getUTCHours();

  if (utcHour >= 0 && utcHour < 7) return 'TOKYO';
  if (utcHour >= 7 && utcHour < 13) return 'LONDON';
  if (utcHour >= 13 && utcHour < 22) return 'NEW YORK';
  return 'SYDNEY';
}

export const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'scalping-1m',
    name: 'SCALPING 1M',
    indicators: ['ema', 'rsi', 'volume'],
    tpRatio: 1.5,
    slRatio: 1.0,
    maxLot: 2.0,
    confluencesRequired: 3,
  },
  {
    id: 'swing-h4',
    name: 'SWING H4',
    indicators: ['ema', 'rsi', 'macd', 'structure'],
    tpRatio: 3.0,
    slRatio: 1.0,
    maxLot: 1.0,
    confluencesRequired: 4,
  },
  {
    id: 'breakout-m15',
    name: 'BREAKOUT M15',
    indicators: ['volume', 'structure', 'macd'],
    tpRatio: 2.0,
    slRatio: 1.0,
    maxLot: 1.5,
    confluencesRequired: 3,
  },
];

import type { Strategy } from '../types/trading';
