import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TradingState, DashboardView, ChartType } from '../types/trading';
import { DEFAULT_CONFLUENCES, detectSession, ASSETS } from '../config/assets';

type Action =
  | { type: 'SET_ASSET'; payload: string }
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'SET_LOT'; payload: number }
  | { type: 'TOGGLE_CONFLUENCE'; payload: number }
  | { type: 'OPEN_ORDER'; payload: { type: 'BUY' | 'SELL'; price: number } }
  | { type: 'CLOSE_ORDER' }
  | { type: 'UPDATE_PNL'; payload: number }
  | { type: 'SET_VIEW'; payload: DashboardView }
  | { type: 'SET_VIEW_MODE'; payload: number }
  | { type: 'SET_SENTIMENT'; payload: TradingState['sentiment'] }
  | { type: 'SET_STRATEGY'; payload: TradingState['activeStrategy'] }
  | { type: 'UPDATE_PORTFOLIO'; payload: Partial<TradingState['portfolio']> }
  | { type: 'SET_COMM_CONFIG'; payload: Partial<TradingState['commConfig']> }
  | { type: 'SET_CHART_TYPE'; payload: ChartType }
  | { type: 'TICK'; payload: { price: number; history: number[] } };

const initialState: TradingState = {
  activeAsset: 'NASDAQ 100',
  lotSize: 1.1,
  isActive: false,
  orderType: null,
  entryPrice: 0,
  currentPnl: 0,
  tp: 0,
  sl: 0,
  confluences: [...DEFAULT_CONFLUENCES],
  balance: 10000.0,
  priceHistory: Array(60).fill(18196.4),
  sentiment: 'NEUTRAL',
  session: detectSession(),
  viewMode: 0,
  currentView: 'cockpit',
  activeStrategy: null,
  portfolio: {
    balance: 10000.0,
    equity: 10000.0,
    margin: 0,
    freeMargin: 10000.0,
    marginLevel: 0,
    openPositions: 0,
    totalPnl: 0,
  },
  commConfig: {
    mode: 'simulation',
    apiUrl: 'https://api.streettraders.io/v1',
    wsUrl: 'wss://ws.streettraders.io',
    apiKey: '',
    connected: false,
  },
  chartType: 'area',
};

function tradingReducer(state: TradingState, action: Action): TradingState {
  switch (action.type) {
    case 'SET_ASSET':
      if (state.isActive) return state;
      return {
        ...state,
        activeAsset: action.payload,
        priceHistory: Array(60).fill(
          state.activeAsset === action.payload ? state.priceHistory[state.priceHistory.length - 1] : 0
        ),
      };

    case 'SET_PRICE':
      return { ...state };

    case 'SET_LOT':
      if (state.isActive) return state;
      return { ...state, lotSize: Math.max(0.1, Number(action.payload.toFixed(1))) };

    case 'TOGGLE_CONFLUENCE':
      if (state.isActive) return state;
      const newConfluences = [...state.confluences];
      newConfluences[action.payload] = {
        ...newConfluences[action.payload],
        active: !newConfluences[action.payload].active,
      };
      return { ...state, confluences: newConfluences };

    case 'OPEN_ORDER': {
      const conf = ASSETS[state.activeAsset];
      const entry = action.payload.price;
      let tp: number, sl: number;

      if (action.payload.type === 'BUY') {
        tp = Number((entry + conf.pipValue).toFixed(conf.decimals));
        sl = Number((entry - conf.pipValue / 2).toFixed(conf.decimals));
      } else {
        tp = Number((entry - conf.pipValue).toFixed(conf.decimals));
        sl = Number((entry + conf.pipValue / 2).toFixed(conf.decimals));
      }

      return {
        ...state,
        isActive: true,
        orderType: action.payload.type,
        entryPrice: entry,
        tp,
        sl,
      };
    }

    case 'CLOSE_ORDER':
      return {
        ...state,
        isActive: false,
        orderType: null,
        currentPnl: 0,
        entryPrice: 0,
        balance: Number((state.balance + state.currentPnl).toFixed(2)),
        confluences: DEFAULT_CONFLUENCES,
      };

    case 'UPDATE_PNL':
      return { ...state, currentPnl: action.payload };

    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload === 0 ? 1 : 0 };

    case 'SET_SENTIMENT':
      return { ...state, sentiment: action.payload };

    case 'SET_STRATEGY':
      return { ...state, activeStrategy: action.payload };

    case 'UPDATE_PORTFOLIO':
      return { ...state, portfolio: { ...state.portfolio, ...action.payload } };

    case 'SET_COMM_CONFIG':
      return { ...state, commConfig: { ...state.commConfig, ...action.payload } };

    case 'SET_CHART_TYPE':
      return { ...state, chartType: action.payload };

    case 'TICK': {
      const conf = ASSETS[state.activeAsset];
      let newPnl = state.currentPnl;

      if (state.isActive && state.orderType) {
        const mult = conf.multiplier * state.lotSize;
        if (state.orderType === 'BUY') {
          newPnl = Number(((action.payload.price - state.entryPrice) * mult).toFixed(2));
          if (action.payload.price >= state.tp || action.payload.price <= state.sl) {
            return {
              ...tradingReducer(state, { type: 'CLOSE_ORDER' }),
              priceHistory: action.payload.history,
              sentiment:
                action.payload.price >= state.priceHistory[state.priceHistory.length - 1]
                  ? 'ALCISTA'
                  : 'BAJISTA',
            };
          }
        } else {
          newPnl = Number(((state.entryPrice - action.payload.price) * mult).toFixed(2));
          if (action.payload.price <= state.tp || action.payload.price >= state.sl) {
            return {
              ...tradingReducer(state, { type: 'CLOSE_ORDER' }),
              priceHistory: action.payload.history,
              sentiment:
                action.payload.price >= state.priceHistory[state.priceHistory.length - 1]
                  ? 'ALCISTA'
                  : 'BAJISTA',
            };
          }
        }
      }

      const equity = Number((state.balance + newPnl).toFixed(2));
      return {
        ...state,
        priceHistory: action.payload.history,
        currentPnl: newPnl,
        sentiment:
          action.payload.price >= state.priceHistory[state.priceHistory.length - 1]
            ? 'ALCISTA'
            : 'BAJISTA',
        portfolio: {
          ...state.portfolio,
          balance: state.balance,
          equity,
          totalPnl: newPnl,
          openPositions: state.isActive ? 1 : 0,
        },
      };
    }

    default:
      return state;
  }
}

const TradingContext = createContext<{
  state: TradingState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error('useTrading must be inside TradingProvider');
  return ctx;
}
