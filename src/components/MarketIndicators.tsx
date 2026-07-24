import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';

export function MarketIndicators() {
  const { state } = useTrading();
  const conf = ASSETS[state.activeAsset];
  const price = state.priceHistory[state.priceHistory.length - 1] || conf.base;
  const history = state.priceHistory;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const position = ((price - min) / range) * 100;

  // Derived from actual price history
  const priceChanges = history.length > 1
    ? history.slice(1).map((p, i) => Math.abs(p - history[i]))
    : [0];
  const avgVolatility = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;
  const volume = Math.min(95, Math.round((avgVolatility / (conf.base * 0.001)) * 100));
  const spread = price > 1000
    ? (avgVolatility * 0.3).toFixed(1)
    : (avgVolatility * 0.1).toFixed(4);
  const atr = ((max - min) * 0.6).toFixed(conf.decimals);
  const change = history.length > 1 ? ((price - history[0]) / history[0] * 100).toFixed(2) : '0.00';

  return (
    <div className="market-indicators">
      <div className="panel-header">MARKET TELEMETRY</div>
      <div className="indicators-grid">
        <div className="indicator">
          <div className="ind-label">VOLUME</div>
          <div className="ind-gauge">
            <div className="ind-fill" style={{ height: `${volume}%` }} />
          </div>
          <div className="ind-value">{volume}%</div>
        </div>
        <div className="indicator">
          <div className="ind-label">SPREAD</div>
          <div className="ind-gauge">
            <div className="ind-fill spread" style={{ height: `${Math.min(Number(spread) * 20, 100)}%` }} />
          </div>
          <div className="ind-value">{spread}</div>
        </div>
        <div className="indicator">
          <div className="ind-label">ATR</div>
          <div className="ind-gauge">
            <div className="ind-fill atr" style={{ height: `${position}%` }} />
          </div>
          <div className="ind-value">{atr}</div>
        </div>
        <div className="indicator">
          <div className="ind-label">Δ24H</div>
          <div className="ind-gauge">
            <div
              className={`ind-fill ${Number(change) >= 0 ? 'positive' : 'negative'}`}
              style={{ height: `${Math.min(Math.abs(Number(change)) * 5, 100)}%` }}
            />
          </div>
          <div className={`ind-value ${Number(change) >= 0 ? 'positive' : 'negative'}`}>
            {Number(change) >= 0 ? '+' : ''}{change}%
          </div>
        </div>
      </div>
      <div className="price-range">
        <span className="range-low">{min.toFixed(conf.decimals)}</span>
        <div className="range-bar">
          <div className="range-marker" style={{ left: `${position}%` }} />
        </div>
        <span className="range-high">{max.toFixed(conf.decimals)}</span>
      </div>
    </div>
  );
}
