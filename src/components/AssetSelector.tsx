import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';

export function AssetSelector() {
  const { state, dispatch } = useTrading();
  const categories = Object.entries(
    Object.values(ASSETS).reduce(
      (acc, a) => {
        if (!acc[a.category]) acc[a.category] = [];
        acc[a.category].push(a);
        return acc;
      },
      {} as Record<string, typeof ASSETS[string][]>
    )
  );

  const categoryLabels: Record<string, string> = {
    crypto: 'CRYPTO',
    forex: 'FOREX',
    indices: 'INDICES',
    metals: 'METALS',
  };

  return (
    <div className="asset-panel">
      <div className="panel-header">ASSET SELECTOR</div>
      <div className="asset-list">
        {categories.map(([cat, assets]) => (
          <div key={cat} className="asset-group">
            <div className="asset-category">{categoryLabels[cat] || cat.toUpperCase()}</div>
            {assets.map((a) => (
              <button
                key={a.symbol}
                className={`btn-asset ${state.activeAsset === a.symbol ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ASSET', payload: a.symbol })}
                disabled={state.isActive}
              >
                {a.symbol}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="asset-info">
        <div className="ai-row">
          <span className="ai-label">SENTIMENT</span>
          <span className={`ai-value ${state.sentiment === 'ALCISTA' ? 'positive' : state.sentiment === 'BAJISTA' ? 'negative' : ''}`}>
            {state.sentiment}
          </span>
        </div>
        <div className="ai-row">
          <span className="ai-label">SESSION</span>
          <span className="ai-value accent">{state.session}</span>
        </div>
      </div>
    </div>
  );
}
