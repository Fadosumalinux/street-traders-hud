import { useTrading } from '../context/TradingContext';

export function ConfluenceSemaphor() {
  const { state, dispatch } = useTrading();
  const allOk = state.confluences.every((c) => c.active);
  const activeCount = state.confluences.filter((c) => c.active).length;

  return (
    <div className="confluence-panel">
      <div className="panel-header">CONFLUENCE SIGNALS</div>
      <div className="confluence-count">
        <span className={`count-num ${allOk ? 'complete' : ''}`}>{activeCount}</span>
        <span className="count-total">/ {state.confluences.length}</span>
      </div>
      <div className="confluence-leds">
        {state.confluences.map((c, i) => (
          <button
            key={c.id}
            className={`led-btn ${c.active ? (allOk ? 'nominal' : 'warning') : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_CONFLUENCE', payload: i })}
            disabled={state.isActive}
            title={c.label}
          >
            <span className="led-light" />
            <span className="led-label">{c.label}</span>
          </button>
        ))}
      </div>
      {allOk && !state.isActive && (
        <div className="confluence-status ready">SETUP VALIDADO</div>
      )}
      {state.isActive && (
        <div className="confluence-status active">
          ORDEN {state.orderType} ACTIVE
        </div>
      )}
    </div>
  );
}
