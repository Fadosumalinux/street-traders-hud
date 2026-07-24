import { useEffect, useRef, useCallback } from 'react';
import { ASSETS } from '../config/assets';

type PriceCallback = (price: number) => void;

const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

// Binance mini ticker stream: <symbol>@miniTicker
// Binance kline stream: <symbol>@kline_1m

export function useBinancePrices(
  assetSymbol: string,
  onPrice: PriceCallback,
  enabled: boolean
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPriceRef = useRef(onPrice);
  onPriceRef.current = onPrice;

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const conf = ASSETS[assetSymbol];
    if (!conf?.binancePair || !enabled) return;

    const streamName = `${conf.binancePair.toLowerCase()}@miniTicker`;
    const url = `${BINANCE_WS}/${streamName}`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log(`[ST] WS connected: ${conf.binancePair}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // miniTicker event structure
          // { "e": "24hrMiniTicker", "s": "BTCUSDT", "c": "67240.50", ... }
          if (data.e === '24hrMiniTicker' && data.c) {
            const price = parseFloat(data.c);
            if (!isNaN(price)) {
              onPriceRef.current(price);
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = (err) => {
        console.warn('[ST] WS error, will reconnect:', err);
      };

      ws.onclose = () => {
        console.log('[ST] WS closed, reconnecting in 3s...');
        if (enabled) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      wsRef.current = ws;
    } catch {
      console.warn('[ST] WS connection failed');
      if (enabled) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    }
  }, [assetSymbol, enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
