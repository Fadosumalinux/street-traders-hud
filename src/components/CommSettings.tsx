import { useTrading } from '../context/TradingContext';

export function CommSettings() {
  const { state, dispatch } = useTrading();
  const { commConfig } = state;

  return (
    <div className="comm-settings">
      <div className="panel-header">COMMUNICATION SETTINGS</div>
      <div className="comm-grid">
        <div className="comm-field">
          <label className="comm-label">MODE</label>
          <div className="comm-toggle-group">
            <button
              className={`comm-toggle ${commConfig.mode === 'simulation' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_COMM_CONFIG', payload: { mode: 'simulation' } })}
            >
              SIMULATION
            </button>
            <button
              className={`comm-toggle ${commConfig.mode === 'live' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_COMM_CONFIG', payload: { mode: 'live' } })}
            >
              LIVE
            </button>
          </div>
        </div>
        <div className="comm-field">
          <label className="comm-label">API URL</label>
          <input
            className="comm-input"
            value={commConfig.apiUrl}
            onChange={(e) => dispatch({ type: 'SET_COMM_CONFIG', payload: { apiUrl: e.target.value } })}
            placeholder="https://api.streettraders.io/v1"
          />
        </div>
        <div className="comm-field">
          <label className="comm-label">WS URL</label>
          <input
            className="comm-input"
            value={commConfig.wsUrl}
            onChange={(e) => dispatch({ type: 'SET_COMM_CONFIG', payload: { wsUrl: e.target.value } })}
            placeholder="wss://ws.streettraders.io"
          />
        </div>
        <div className="comm-field">
          <label className="comm-label">API KEY</label>
          <input
            className="comm-input"
            type="password"
            value={commConfig.apiKey}
            onChange={(e) => dispatch({ type: 'SET_COMM_CONFIG', payload: { apiKey: e.target.value } })}
            placeholder="Enter your API key"
          />
        </div>
        <div className="comm-status">
          <div className={`status-dot ${commConfig.connected ? 'connected' : ''}`} />
          <span>{commConfig.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>
      </div>
    </div>
  );
}
