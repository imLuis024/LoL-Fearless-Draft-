import { useDraftStore } from '../logic/store';
import { TRANSLATIONS } from '../logic/translations';

const SideChoiceModal = ({ isOpen, onClose, onConfirm, currentTeam1IsBlue }) => {
    const { uiLanguage } = useDraftStore();
    const t = TRANSLATIONS[uiLanguage] || TRANSLATIONS.en;

    if (!isOpen) return null;

    // TODO: Add these specific translations to translations.js later, using hardcoded for now or fallbacks
    // We will hardcode for this specific request to match the user's prompt
    // "Winner Selected. Next Match: Swap Sides?"

    // Logic for "Currently: Team 1: Blue - Team 2: Red"
    const statusText = currentTeam1IsBlue
        ? "Team 1: Blue Side - Team 2: Red Side"
        : "Team 1: Red Side - Team 2: Blue Side";

    const statusTextEs = currentTeam1IsBlue
        ? "Equipo 1: Lado Azul - Equipo 2: Lado Rojo"
        : "Equipo 1: Lado Rojo - Equipo 2: Lado Azul";

    const isSpanish = uiLanguage.startsWith('es');

    const title = isSpanish ? "¿Cambiar de lados?" : "Swap Sides?";
    const currentLabel = isSpanish ? "Actualmente:" : "Currently:";
    const status = isSpanish ? statusTextEs : statusText;
    const yes = isSpanish ? "Sí" : "Yes";
    const no = isSpanish ? "No" : "No";

    return (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1600 }}
        >
            <div className="glass-panel p-8 rounded-lg shadow-2xl relative"
                style={{
                    padding: '2rem',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '500px',
                    textAlign: 'center',
                    border: '1px solid var(--color-gold)',
                    background: 'rgba(16, 20, 30, 0.95)',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8)'
                }}>

                <h2 className="text-3xl font-bold mb-4 text-gold uppercase tracking-widest"
                    style={{ color: 'var(--color-gold)', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '1rem' }}>
                    {title}
                </h2>

                <div style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    <span style={{ display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{currentLabel}</span>
                    <span style={{ color: '#f0e6d2', fontWeight: 'bold' }}>{status}</span>
                </div>

                <div className="flex gap-6 justify-center" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>

                    {/* Swap Button (Yes) */}
                    <button
                        onClick={() => onConfirm(true)}
                        className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{
                            padding: '1rem 3rem',
                            border: '1px solid #c8aa6e',
                            background: 'rgba(200, 170, 110, 0.1)',
                            color: '#c8aa6e',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        {yes}
                    </button>

                    {/* Stay Button (No) */}
                    <button
                        onClick={() => onConfirm(false)}
                        className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{
                            padding: '1rem 3rem',
                            border: '1px solid #444',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#aaa',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        {no}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default SideChoiceModal;
