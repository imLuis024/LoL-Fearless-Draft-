import { useState } from 'react';
import { useDraftStore } from '../logic/store';

const Header = () => {
    const { gameCount, nextGame, resetSeries, getCurrentStep, audioLanguage, setAudioLanguage } = useDraftStore();
    const currentStep = getCurrentStep();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    // Using short codes for the button display as per design
    const LANGUAGES = [
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

    const currentLang = LANGUAGES.find(l => l.code === audioLanguage) || LANGUAGES[0];

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

            <div className="header-right relative" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                {/* Language Selector Dropdown */}
                <div className="relative" style={{ position: 'relative' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        title="Change Audio Language"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            minWidth: '60px',
                            height: '100%',
                            aspectRatio: 'unset',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <span className="text-sm font-bold" style={{ fontSize: '0.7rem', marginTop: '4px' }}>{currentLang.short}</span>
                    </button>

                    {isLangMenuOpen && (
                        <div className="glass-panel" style={{
                            position: 'absolute',
                            top: '50%',
                            right: '100%',
                            transform: 'translateY(-50%)',
                            marginRight: '1rem',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            zIndex: 50,
                            overflowX: 'auto',
                            maxWidth: '400px',
                            alignItems: 'center'
                        }}>
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`btn-icon ${audioLanguage === lang.code ? 'active' : ''}`}
                                    onClick={() => {
                                        setAudioLanguage(lang.code);
                                        setIsLangMenuOpen(false);
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
                    <button className="btn-primary" onClick={nextGame}>
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
