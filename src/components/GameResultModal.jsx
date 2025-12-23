import { useState } from 'react';
import { useDraftStore } from '../logic/store';
import { TRANSLATIONS } from '../logic/translations';

const GameResultModal = ({ isOpen, onClose, onConfirm }) => {
    const { uiLanguage } = useDraftStore();
    const t = TRANSLATIONS[uiLanguage] || TRANSLATIONS.en;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1500 }}
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

                <h2 className="text-3xl font-bold mb-8 text-gold uppercase tracking-widest"
                    style={{ color: 'var(--color-gold)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {t.WHO_WON}?
                </h2>

                <div className="flex gap-6 justify-center" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>

                    {/* Blue Team Button */}
                    <button
                        onClick={() => onConfirm('BLUE')}
                        className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{
                            padding: '1.5rem 3rem',
                            border: '1px solid #0acbe6',
                            background: 'linear-gradient(135deg, rgba(10, 203, 230, 0.1) 0%, rgba(10, 203, 230, 0.2) 100%)',
                            color: '#0acbe6',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        <span className="relative z-10 drop-shadow-md">{t.BLUE_TEAM}</span>
                        <div className="absolute inset-0 bg-[#0acbe6] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>

                    {/* Red Team Button */}
                    <button
                        onClick={() => onConfirm('RED')}
                        className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{
                            padding: '1.5rem 3rem',
                            border: '1px solid #ff4655',
                            background: 'linear-gradient(135deg, rgba(255, 70, 85, 0.1) 0%, rgba(255, 70, 85, 0.2) 100%)',
                            color: '#ff4655',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        <span className="relative z-10 drop-shadow-md">{t.RED_TEAM}</span>
                        <div className="absolute inset-0 bg-[#ff4655] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </button>

                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                        style={{
                            marginTop: '2rem',
                            color: '#888',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontSize: '0.8rem'
                        }}
                    >
                        {/* Translate 'Cancel' if possible, else hardcode */}
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameResultModal;
