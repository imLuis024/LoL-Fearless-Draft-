import { useEffect } from 'react';
import { useDraftStore } from './logic/store';
import Header from './components/Header';
import DraftBoard from './components/DraftBoard';
import ChampionGrid from './components/ChampionGrid';
import SeriesSummary from './components/SeriesSummary';
import './index.css';

function App() {
  const { gameCount, loadChampions, isSeriesComplete } = useDraftStore();

  useEffect(() => {
    loadChampions();
  }, []);

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <div className="draft-section">
          <DraftBoard />
        </div>

        <div className="grid-section glass-panel">
          <ChampionGrid />
        </div>
      </div>

      <div className="bg-overlay"></div>

      <SeriesSummary isOpen={isSeriesComplete} />
    </div>
  );
}

export default App;
