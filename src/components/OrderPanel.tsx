import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';

export function OrderPanel() {
  const { state, dispatch } = useTrading();
  const conf = ASSETS[state.activeAsset];
  const allOk = state.confluences.every((c) => c.active);
  const eq = Number((state.balance + state.currentPnl).toFixed(2));
  const price = state.priceHistory[state.priceHistory.length - 1] || conf.base;
  const prevPrice = state.priceHistory[state.priceHistory.length - 2] || price;
  const isUp = price >= prevPrice;

  return (
    <div className="order-panel">
      <div className="panel-header">ORDER MANAGEMENT</div>

      <div className="lot-control">
        <span className="lot-label">LOT</span>
        <div className="lot-box">
          <button className="btn-math" onClick={() => dispatch({ type: 'SET_LOT', payload: state.lotSize - 0.1 })} disabled={state.isActive}>
            -
          </button>
          <div className="lot-value">{state.lotSize.toFixed(1)}</div>
          <button className="btn-math" onClick={() => dispatch({ type: 'SET_LOT', payload: state.lotSize + 0.1 })} disabled={state.isActive}>
            +
          </button>
        </div>
      </div>

      <button
        className={`btn-order btn-buy ${state.isActive && state.orderType === 'BUY' ? 'active' : ''}`}
        onClick={() => {
          if (!state.isActive && allOk) {
            dispatch({ type: 'OPEN_ORDER', payload: { type: 'BUY', price: state.priceHistory[state.priceHistory.length - 1] } });
          }
        }}
        disabled={(state.isActive && state.orderType !== 'BUY') || (!allOk && !state.isActive)}
      >
        <span className="btn-icon">🟢</span> BUY
      </button>

      <button
        className={`btn-order btn-sell ${state.isActive && state.orderType === 'SELL' ? 'active' : ''}`}
        onClick={() => {
          if (!state.isActive && allOk) {
            dispatch({ type: 'OPEN_ORDER', payload: { type: 'SELL', price: state.priceHistory[state.priceHistory.length - 1] } });
          }
        }}
        disabled={(state.isActive && state.orderType !== 'SELL') || (!allOk && !state.isActive)}
      >
        <span className="btn-icon">🔴</span> SELL
      </button>

      <button
        className="btn-order btn-close"
        onClick={() => dispatch({ type: 'CLOSE_ORDER' })}
        disabled={!state.isActive}
      >
        ⚠ CLOSE POSITION
      </button>

      {/* Asset Ticket */}
      <div className="asset-ticket">
        <div className="at-symbol">{state.activeAsset}</div>
        <div className="at-price" data-dir={isUp ? 'up' : 'down'}>
          {price.toFixed(conf.decimals)}
        </div>
        <div className="at-meta">
          <span className="at-category">{conf.category.toUpperCase()}</span>
          <span className="at-delta" data-dir={isUp ? 'up' : 'down'}>
            {isUp ? '▲' : '▼'} {Math.abs(price - conf.base).toFixed(conf.decimals)}
          </span>
        </div>
        <div className="at-range">
          <span className="at-range-item">
            <span className="atl">LOT</span>
            <span className="atv">{state.lotSize.toFixed(1)}</span>
          </span>
          <span className="at-range-item">
            <span className="atl">MULT</span>
            <span className="atv">x{conf.multiplier}</span>
          </span>
          <span className="at-range-item">
            <span className="atl">PIPs</span>
            <span className="atv">{conf.pipValue}</span>
          </span>
        </div>
      </div>

      <div className="order-info">
        <div className="info-row">
          <span className="info-label">EQUITY</span>
          <span className={`info-value ${state.currentPnl >= 0 ? 'positive' : 'negative'}`}>
            ${eq.toFixed(2)}
          </span>
        </div>
        {state.isActive && (
          <>
            <div className="info-row">
              <span className="info-label">PNL</span>
              <span className={`info-value ${state.currentPnl >= 0 ? 'positive' : 'negative'}`}>
                ${state.currentPnl.toFixed(2)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">T/P</span>
              <span className="info-value tp">{state.tp.toFixed(conf.decimals)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">S/L</span>
              <span className="info-value sl">{state.sl.toFixed(conf.decimals)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">TYPE</span>
              <span className={`info-value ${state.orderType === 'BUY' ? 'positive' : 'negative'}`}>
                {state.orderType}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
