import { useTrading } from '../context/TradingContext';
import { useMarketClock } from '../hooks/useMarketClock';
import { AssetTicker } from './AssetTicker';

const MARKETS: Record<string, { hours: string; status: string }> = {
  TOKYO: { hours: '00:00-09:00 UTC', status: 'ASIA-PACIFIC' },
  LONDON: { hours: '08:00-17:00 UTC', status: 'EUROPE' },
  'NEW YORK': { hours: '13:00-22:00 UTC', status: 'AMERICAS' },
  SYDNEY: { hours: '22:00-07:00 UTC', status: 'OCEANIA' },
};

export function TopBar() {
  const { state } = useTrading();
  const clock = useMarketClock();
  const allOk = state.confluences.every((c) => c.active);
  const market = MARKETS[clock.session] || MARKETS.SYDNEY;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">ST LABS</div>
        <span className="version">v7.0</span>
      </div>

      <div className="topbar-center">
        <div className="session-badge" data-session={clock.session.toLowerCase()}>
          <span className="session-dot" />
          <span className="sb-market">{market.status}</span>
          <span className="sb-session">{clock.session}</span>
        </div>
        <div className="market-status">
          {state.commConfig.mode === 'live' ? 'LIVE FEED' : 'SIMULATION'}
        </div>
        <div className="system-status" data-ok={allOk}>
          {allOk ? 'SYSTEM NOMINAL' : 'AWAITING SETUP'}
        </div>
      </div>

      <div className="topbar-right">
        <AssetTicker />
        <div className="clock-divider" />
        <div className="clock-group">
          <div className="clock-local">
            <span className="cl-time">
              {clock.hours}:{clock.minutes}
              <span className="cl-seconds">:{clock.seconds}</span>
            </span>
            <span className="cl-zone">LOCAL</span>
          </div>
          <div className="clock-market">
            <span className="cm-session">{clock.session}</span>
            <span className="cm-hours">{market.hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
