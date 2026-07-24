import { TradingProvider } from './context/TradingContext';
import { usePriceEngine } from './hooks/usePriceEngine';
import { TopBar } from './components/TopBar';
import { NavBar } from './components/NavBar';
import { PriceDisplay, PriceChart } from './components/PriceDisplay';
import { OrderPanel } from './components/OrderPanel';
import { ConfluenceSemaphor } from './components/ConfluenceSemaphor';
import { AssetSelector } from './components/AssetSelector';
import { MarketIndicators } from './components/MarketIndicators';
import { StrategyManager } from './components/StrategyManager';
import { PortfolioPanel } from './components/PortfolioPanel';
import { CommSettings } from './components/CommSettings';
import { useTrading } from './context/TradingContext';
import './index.css';

function Dashboard() {
  usePriceEngine();
  const { state } = useTrading();

  return (
    <div className="dashboard">
      <TopBar />
      <NavBar />

      <main className="dashboard-main">
        {state.currentView === 'cockpit' && (
          <div className="cockpit-layout">
            <aside className="panel-left">
              <AssetSelector />
              <ConfluenceSemaphor />
            </aside>

            <section className="panel-center">
              <div className="center-top">
                <PriceDisplay />
                <MarketIndicators />
              </div>
              <PriceChart />
              <PortfolioPanel />
            </section>

            <aside className="panel-right">
              <OrderPanel />
            </aside>
          </div>
        )}

        {state.currentView === 'strategy' && <StrategyManager />}
        {state.currentView === 'portfolio' && <PortfolioPanel />}
        {state.currentView === 'settings' && <CommSettings />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TradingProvider>
      <Dashboard />
    </TradingProvider>
  );
}
