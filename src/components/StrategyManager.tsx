import { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { DEFAULT_STRATEGIES } from '../config/assets';
import type { Strategy } from '../types/trading';

export function StrategyManager() {
  const { state, dispatch } = useTrading();
  const [strategies] = useState<Strategy[]>(DEFAULT_STRATEGIES);

  const selectStrategy = (s: Strategy) => {
    dispatch({ type: 'SET_STRATEGY', payload: s });
    dispatch({ type: 'SET_VIEW', payload: 'cockpit' });
  };

  return (
    <div className="strategy-manager">
      <div className="panel-header">STRATEGY MANAGER</div>
      <div className="strategy-list">
        {strategies.map((s) => (
          <div
            key={s.id}
            className={`strategy-card ${state.activeStrategy?.id === s.id ? 'active' : ''}`}
          >
            <div className="sc-header">
              <span className="sc-name">{s.name}</span>
              <span className="sc-confluences">{s.confluencesRequired} signals</span>
            </div>
            <div className="sc-details">
              <div className="sc-row">
                <span className="sc-label">TP Ratio</span>
                <span className="sc-val positive">{s.tpRatio}x</span>
              </div>
              <div className="sc-row">
                <span className="sc-label">SL Ratio</span>
                <span className="sc-val negative">{s.slRatio}x</span>
              </div>
              <div className="sc-row">
                <span className="sc-label">Max Lot</span>
                <span className="sc-val">{s.maxLot}</span>
              </div>
              <div className="sc-row">
                <span className="sc-label">Indicators</span>
                <span className="sc-val">{s.indicators.join(', ')}</span>
              </div>
            </div>
            <button className="btn-select" onClick={() => selectStrategy(s)}>
              {state.activeStrategy?.id === s.id ? 'ACTIVE' : 'SELECT'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
