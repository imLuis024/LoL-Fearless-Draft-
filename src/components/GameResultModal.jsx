import { useDraftStore } from '../logic/store';

const GameResultModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    const { gameCount } = useDraftStore();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div className="glass-panel p-8 flex flex-col items-center gap-6 animate-fade-in"
                style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    maxWidth: '400px',
                    width: '90%',
                    border: '1px solid var(--color-gold-200)',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                }}
            >
                <div>
                    <h2 className="text-2xl font-bold text-gold-gradient text-center mb-2" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                        GAME {gameCount} RESULT
                    </h2>
                    <p className="text-text-secondary text-center" style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        Who won this game?
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <button
                        onClick={() => onConfirm('BLUE')}
                        className="p-4 border border-blue-action/50 hover:bg-blue-action/10 transition-all group"
                        style={{
                            padding: '1rem',
                            border: '1px solid var(--color-blue-action)',
                            background: 'rgba(9, 20, 40, 0.6)',
                            color: 'var(--color-blue-action)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>BLUE TEAM VICTORY</span>
                        <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    </button>

                    <button
                        onClick={() => onConfirm('RED')}
                        className="p-4 border border-red-action/50 hover:bg-red-action/10 transition-all group"
                        style={{
                            padding: '1rem',
                            border: '1px solid var(--color-red-action)',
                            background: 'rgba(9, 20, 40, 0.6)',
                            color: 'var(--color-red-action)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span>RED TEAM VICTORY</span>
                        <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="text-sm text-text-secondary hover:text-white mt-2"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginTop: '0.5rem',
                        textDecoration: 'underline'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default GameResultModal;
