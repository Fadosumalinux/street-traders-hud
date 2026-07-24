import { useTrading } from '../context/TradingContext';
import type { DashboardView } from '../types/trading';

const NAV_ITEMS: { view: DashboardView; icon: string; label: string }[] = [
  { view: 'cockpit', icon: '◈', label: 'COCKPIT' },
  { view: 'strategy', icon: '◆', label: 'STRATEGY' },
  { view: 'portfolio', icon: '◇', label: 'PORTFOLIO' },
  { view: 'settings', icon: '⚙', label: 'COMMS' },
];

export function NavBar() {
  const { state, dispatch } = useTrading();

  return (
    <nav className="navbar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.view}
          className={`nav-btn ${state.currentView === item.view ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
