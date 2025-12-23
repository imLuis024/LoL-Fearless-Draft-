import { useDraftStore } from '../logic/store';

const Header = () => {
    const { gameCount, nextGame, resetSeries, getCurrentStep } = useDraftStore();
    const currentStep = getCurrentStep();

    return (
        <header className="header glass-panel">
            <div className="header-left">
                <h1 className="logo text-gold-gradient">FEARLESS DRAFT</h1>
            </div>

            <div className="header-center">
                <div className="game-indicator">
                    <span className="game-label text-gold">GAME</span>
                    <span className="game-number">{gameCount}</span>
                </div>
                <div className="phase-indicator">
                    {currentStep ? (
                        <span className={currentStep.side === 'BLUE' ? 'text-blue' : 'text-red'}>
                            {currentStep.side} SIDE {currentStep.type}
                        </span>
                    ) : (
                        <span className="text-gold">DRAFT COMPLETE</span>
                    )}
                </div>
            </div>

            <div className="header-right">
                {!currentStep && (
                    <button className="btn-primary space-right" onClick={nextGame}>
                        NEXT GAME
                    </button>
                )}
                <button className="btn-secondary" onClick={() => {
                    if (confirm('Are you sure you want to reset the series?')) resetSeries();
                }}>
                    RESET
                </button>
            </div>
        </header>
    );
};

export default Header;
