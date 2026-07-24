import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';

export function PortfolioPanel() {
  const { state } = useTrading();
  const { currentPnl, balance } = state;
  const conf = ASSETS[state.activeAsset];
  const equity = Number((balance + currentPnl).toFixed(2));

  return (
    <div className="portfolio-panel">
      <div className="panel-header">PORTFOLIO</div>
      <div className="portfolio-grid">
        <div className="pf-item">
          <span className="pf-label">BALANCE</span>
          <span className="pf-value">${balance.toFixed(2)}</span>
        </div>
        <div className="pf-item">
          <span className="pf-label">EQUITY</span>
          <span className={`pf-value ${currentPnl >= 0 ? 'positive' : 'negative'}`}>
            ${equity.toFixed(2)}
          </span>
        </div>
        <div className="pf-item">
          <span className="pf-label">MARGIN</span>
          <span className="pf-value">${state.isActive ? (conf.base * conf.multiplier * state.lotSize * 0.01).toFixed(2) : '0.00'}</span>
        </div>
        <div className="pf-item">
          <span className="pf-label">FREE MARGIN</span>
          <span className="pf-value">${(equity - (state.isActive ? conf.base * conf.multiplier * state.lotSize * 0.01 : 0)).toFixed(2)}</span>
        </div>
        <div className="pf-item">
          <span className="pf-label">OPEN POS</span>
          <span className="pf-value">{state.isActive ? 1 : 0}</span>
        </div>
        <div className="pf-item">
          <span className="pf-label">TOTAL PNL</span>
          <span className={`pf-value ${currentPnl >= 0 ? 'positive' : 'negative'}`}>
            ${currentPnl.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
