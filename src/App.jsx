import { useDraftStore } from './logic/store';
import Header from './components/Header';
import DraftBoard from './components/DraftBoard';
import ChampionGrid from './components/ChampionGrid';
import './index.css';

function App() {
  const { gameCount } = useDraftStore();

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
    </div>
  );
}

export default App;
