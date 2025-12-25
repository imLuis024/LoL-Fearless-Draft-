import { useState } from 'react';
import { useDraftStore } from '../logic/store';
import GameResultModal from './GameResultModal';
import SideChoiceModal from './SideChoiceModal';
import { TRANSLATIONS } from '../logic/translations';

const Header = () => {
    const {
        gameCount,
        nextGame,
        resetSeries,
        getCurrentStep,
        audioLanguage,
        setAudioLanguage,
        uiLanguage,
        setUiLanguage,
        team1IsBlue,
        setTeam1IsBlue
    } = useDraftStore();

    const currentStep = getCurrentStep();
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    // UI State for Modals
    const [showResultModal, setShowResultModal] = useState(false);
    const [showSideModal, setShowSideModal] = useState(false);
    const [pendingWinner, setPendingWinner] = useState(null);

    const t = TRANSLATIONS[uiLanguage] || TRANSLATIONS.en;

    // ... languages ...

    const AUDIO_LANGUAGES = [
        { code: 'default', label: 'English', short: 'EN', flag: '🇺🇸' },
        { code: 'es_mx', label: 'Spanish (MX)', short: 'MX', flag: '🇲🇽' },
        { code: 'es_es', label: 'Spanish (EU)', short: 'ES', flag: '🇪🇸' },
        { code: 'pt_br', label: 'Portuguese', short: 'BR', flag: '🇧🇷' },
        { code: 'ko_kr', label: 'Korean', short: 'KR', flag: '🇰🇷' },
        { code: 'ja_jp', label: 'Japanese', short: 'JP', flag: '🇯🇵' },
        { code: 'fr_fr', label: 'French', short: 'FR', flag: '🇫🇷' },
        { code: 'de_de', label: 'German', short: 'DE', flag: '🇩🇪' },
        { code: 'it_it', label: 'Italian', short: 'IT', flag: '🇮🇹' },
        { code: 'pl_pl', label: 'Polish', short: 'PL', flag: '🇵🇱' },
        { code: 'ru_ru', label: 'Russian', short: 'RU', flag: '🇷🇺' },
        { code: 'tr_tr', label: 'Turkish', short: 'TR', flag: '🇹🇷' }
    ];

    const UI_LANGUAGES = [
        { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
        { code: 'es', label: 'Español', short: 'ES', flag: '🇲🇽' },
    ];

    const currentAudioLang = AUDIO_LANGUAGES.find(l => l.code === audioLanguage) || AUDIO_LANGUAGES[0];
    const currentUiLang = UI_LANGUAGES.find(l => l.code === uiLanguage) || UI_LANGUAGES[0];

    // Flow: Game Result -> Check Series -> Side Choice (if continuing) -> Next Game
    const handleGameComplete = (winner) => {
        // Simulate the win count to check if series would be complete
        const { history, team1IsBlue } = useDraftStore.getState();

        // Determine winning team
        let winningTeam;
        if (team1IsBlue) {
            winningTeam = winner === 'BLUE' ? 'TEAM1' : 'TEAM2';
        } else {
            winningTeam = winner === 'RED' ? 'TEAM1' : 'TEAM2';
        }

        // Calculate what the new win counts would be
        const team1Wins = history.filter(h => h.winningTeam === 'TEAM1').length + (winningTeam === 'TEAM1' ? 1 : 0);
        const team2Wins = history.filter(h => h.winningTeam === 'TEAM2').length + (winningTeam === 'TEAM2' ? 1 : 0);
        const gameCount = history.length + 1;

        // Check if series would be complete
        const wouldBeSeriesOver = gameCount >= 5 || team1Wins >= 3 || team2Wins >= 3;

        setShowResultModal(false);

        if (wouldBeSeriesOver) {
            // Series is over, skip Side Swap modal and go straight to nextGame
            nextGame(winner);
        } else {
            // Series continues, show Side Swap modal
            setPendingWinner(winner);
            setShowSideModal(true);
        }
    };

    const handleSideConfirm = (shouldSwap) => {
        // CRITICAL: Record the game result BEFORE changing sides
        // The store needs the CURRENT (pre-swap) state to know who was Blue/Red for the game that just finished
        nextGame(pendingWinner);

        if (shouldSwap) {
            setTeam1IsBlue(!team1IsBlue);
        }

        setShowSideModal(false);
        setPendingWinner(null);
    };

    return (
        <header className="header glass-panel">
            <div className="header-left">
                <h1 className="logo text-gold-gradient">FEARLESS DRAFT</h1>
            </div>

            <div className="header-center">
                <div className="game-indicator">
                    <span className="game-label text-gold">{t.GAME}</span>
                    <span className="game-number">{gameCount}</span>
                </div>
                <div className="phase-indicator">
                    {currentStep ? (
                        <span className={currentStep.side === 'BLUE' ? 'text-blue' : 'text-red'}>
                            {(() => {
                                // Determine which team is currently drafting
                                const isTeam1Drafting = (currentStep.side === 'BLUE' && team1IsBlue) || (currentStep.side === 'RED' && !team1IsBlue);
                                const teamLabel = isTeam1Drafting ? t.BLUE_TEAM : t.RED_TEAM; // These now map to "EQUIPO 1" and "EQUIPO 2"
                                const actionLabel = currentStep.type === 'PICK' ? t.PICK : t.BAN;
                                return `${teamLabel} ${actionLabel}`;
                            })()}
                        </span>
                    ) : (
                        <span className="text-gold">{t.DRAFT_COMPLETE}</span>
                    )}
                </div>
            </div>

            <div className="header-right relative" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                {/* UI Language Selector */}
                <div className="relative" style={{ position: 'relative' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setIsLangMenuOpen(!isLangMenuOpen);
                            setIsAudioMenuOpen(false); // Close other
                        }}
                        title="Change Text Language"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            minWidth: '50px',
                            height: '100%',
                            padding: '0.5rem 0.8rem',
                            border: isLangMenuOpen ? '1px solid var(--color-gold)' : undefined
                        }}
                    >
                        <span className="text-xl">🌐</span>
                        <span className="text-sm font-bold" style={{ fontSize: '0.7rem' }}>{currentUiLang.short}</span>
                    </button>

                    {isLangMenuOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute',
                            top: '50%',
                            right: '100%',
                            transform: 'translateY(-50%)',
                            marginRight: '0.5rem',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            zIndex: 60
                        }}>
                            {UI_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`btn-icon ${uiLanguage === lang.code ? 'active' : ''}`}
                                    onClick={() => {
                                        setUiLanguage(lang.code);
                                        setIsLangMenuOpen(false);
                                    }}
                                    style={{
                                        border: uiLanguage === lang.code ? '1px solid var(--color-gold)' : '1px solid transparent',
                                        padding: '0.4rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: '40px'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                    <span style={{ fontSize: '0.6rem' }}>{lang.short}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Audio Language Selector */}
                <div className="relative" style={{ position: 'relative' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setIsAudioMenuOpen(!isAudioMenuOpen);
                            setIsLangMenuOpen(false); // Close other
                        }}
                        title="Change Audio Language"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            minWidth: '50px',
                            height: '100%',
                            padding: '0.5rem 0.8rem',
                            border: isAudioMenuOpen ? '1px solid var(--color-gold)' : undefined
                        }}
                    >
                        <span className="text-xl">🔊</span>
                        <span className="text-sm font-bold" style={{ fontSize: '0.7rem' }}>{currentAudioLang.short}</span>
                    </button>

                    {isAudioMenuOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute',
                            top: '50%',
                            right: '100%',
                            transform: 'translateY(-50%)',
                            marginRight: '0.5rem',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            zIndex: 50,
                            overflowX: 'auto',
                            maxWidth: '400px',
                            alignItems: 'center'
                        }}>
                            {AUDIO_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`btn-icon ${audioLanguage === lang.code ? 'active' : ''}`}
                                    onClick={() => {
                                        setAudioLanguage(lang.code);
                                        setIsAudioMenuOpen(false);
                                    }}
                                    title={lang.label}
                                    style={{
                                        border: audioLanguage === lang.code ? '1px solid var(--color-gold)' : '1px solid transparent',
                                        padding: '0.4rem',
                                        borderRadius: '4px',
                                        background: audioLanguage === lang.code ? 'rgba(200, 155, 60, 0.2)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: '40px'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-primary)' }}>{lang.short}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {!currentStep && (
                    <button className="btn-primary" onClick={() => setShowResultModal(true)}>
                        {t.NEXT_GAME}
                    </button>
                )}

                <button className="btn-secondary" onClick={() => {
                    if (confirm(t.RESET_CONFIRM)) resetSeries();
                }}>
                    {t.RESET}
                </button>
            </div>

            {/* Modals */}
            <GameResultModal
                isOpen={showResultModal}
                onClose={() => setShowResultModal(false)}
                onConfirm={handleGameComplete}
            />

            <SideChoiceModal
                isOpen={showSideModal}
                onClose={() => setShowSideModal(false)}
                onConfirm={handleSideConfirm}
                currentTeam1IsBlue={team1IsBlue}
            />
        </header>
    );
};

export default Header;
