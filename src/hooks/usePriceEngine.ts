import { useEffect, useRef, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';
import { useBinancePrices } from './useBinancePrices';

export function usePriceEngine() {
  const { state, dispatch } = useTrading();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const priceRef = useRef(state.priceHistory[state.priceHistory.length - 1]);

  const conf = ASSETS[state.activeAsset];
  const isLive = state.commConfig.mode === 'live';
  const hasBinance = !!conf.binancePair;

  // Keep priceRef in sync with latest price from history
  useEffect(() => {
    priceRef.current = state.priceHistory[state.priceHistory.length - 1];
  }, [state.priceHistory]);

  const pushPrice = useCallback(
    (newPrice: number) => {
      const newHistory = [...state.priceHistory, newPrice];
      if (newHistory.length > 60) newHistory.shift();
      dispatch({ type: 'TICK', payload: { price: newPrice, history: newHistory } });
    },
    [state.priceHistory, dispatch]
  );

  // Binance live feed
  useBinancePrices(
    state.activeAsset,
    (price) => {
      priceRef.current = price;
      pushPrice(price);
    },
    isLive && hasBinance
  );

  // Simulation fallback
  useEffect(() => {
    if (isLive && hasBinance) {
      // When live + binance, simulation is off
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Simulation mode or assets without binance pair
    const tick = () => {
      const lastPrice = priceRef.current;
      const volatility = conf.base * 0.0006;
      const newPrice = Number(
        (lastPrice + conf.base * (Math.random() - 0.5) * (volatility / conf.base) * 2).toFixed(
          conf.decimals
        )
      );
      priceRef.current = newPrice;
      pushPrice(newPrice);
    };

    intervalRef.current = setInterval(tick, 350);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, hasBinance, conf, pushPrice]);
}
