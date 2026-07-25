import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';

export function AssetTicker() {
  const { state } = useTrading();
  const conf = ASSETS[state.activeAsset];
  const price = state.priceHistory[state.priceHistory.length - 1] || conf.base;
  const prevPrice = state.priceHistory[state.priceHistory.length - 2] || price;
  const isUp = price >= prevPrice;
  const delta = price - conf.base;

  return (
    <div className="asset-ticker">
      <div className="at-left">
        <span className="at-symbol">{state.activeAsset}</span>
        <span className="at-category">{conf.category.toUpperCase()}</span>
      </div>
      <div className="at-center">
        <span className="at-price" data-dir={isUp ? 'up' : 'down'}>
          {price.toFixed(conf.decimals)}
        </span>
        <span className="at-delta" data-dir={isUp ? 'up' : 'down'}>
          {isUp ? '▲' : '▼'} {Math.abs(delta).toFixed(conf.decimals)}
        </span>
      </div>
      <div className="at-right">
        <span className="at-mini">LOT {state.lotSize.toFixed(1)}</span>
        <span className="at-mini">×{conf.multiplier}</span>
      </div>
    </div>
  );
}
