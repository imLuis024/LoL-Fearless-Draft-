import { useRef, useState } from 'react';
import { useDraftStore } from '../logic/store';
import html2canvas from 'html2canvas';

const SeriesSummary = ({ isOpen }) => {
    // NOTE: We don't need 'onClose' because this is a final screen in many cases, 
    // or we can just hide the close button if we want to force them to see it. 
    // But for usability, I'll keep the close button logic internally or via prop if provided.
    // However, the prompt implies "te lleva a esta nueva sección", usually meaning routing. 
    // Since we are using modals/overlays, full screen overlay works.

    const { history } = useDraftStore();
    const summaryRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    // Calculate Stats
    const blueWins = history.filter(h => h.winner === 'BLUE').length;
    const redWins = history.filter(h => h.winner === 'RED').length;

    // Aggregate unique champions played by each team
    // The prompt says "Campeones usados por cada equipo"
    const getUniqueChamps = (games, side) => {
        const all = [];
        games.forEach(g => {
            const picks = side === 'BLUE' ? (g.bluePicks || []) : (g.redPicks || []);
            picks.forEach(p => {
                if (p && !all.find(existing => existing.id === p.id)) {
                    all.push(p);
                }
            });
        });
        return all;
    };

    const getUniqueBans = (games, side) => {
        const all = [];
        games.forEach(g => {
            const bans = side === 'BLUE' ? (g.blueBans || []) : (g.redBans || []);
            bans.forEach(b => {
                // Check if ban exists and is unique (bans can be null/empty if skipped, need to handle that)
                if (b && !all.find(existing => existing.id === b.id)) {
                    all.push(b);
                }
            });
        });
        return all;
    };

    const bluePool = getUniqueChamps(history, 'BLUE');
    const redPool = getUniqueChamps(history, 'RED');

    // For bans, usually we just show all unique bans total, or per team. 
    // Prompt says "Campeones baneados por cada equipo".
    const blueBans = getUniqueBans(history, 'BLUE');
    const redBans = getUniqueBans(history, 'RED');

    const downloadImage = async () => {
        if (!summaryRef.current) return;
        setIsExporting(true);
        // Wait for state update
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(summaryRef.current, {
                    backgroundColor: '#091428',
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `series-result-${new Date().getTime()}.png`;
                link.click();
            } catch (err) {
                console.error("Export failed", err);
            }
            setIsExporting(false);
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-[#091428] overflow-y-auto"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2000,
                background: '#091428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowY: 'auto'
            }}
        >
            <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-4" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>

                {/* Control Bar */}
                <div className="flex justify-end gap-4 mb-4 print:hidden" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    {/* We include a 'Close' just in case, though the user didn't explicitly remove it from the logic. */}
                    {/* The request says 'automaticamente te lleva', implying a page transition. */}
                    <button
                        onClick={downloadImage}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', border: '1px solid var(--color-gold-200)', color: 'var(--color-gold-200)', background: 'transparent', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 'bold' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        {isExporting ? 'GENERATING...' : 'DESCARGAR PARA COMPARTIR'}
                    </button>
                    {/* Optional Close for dev purposes mainly */}
                    <button
                        onClick={() => window.location.reload()} // "Reset" effectively
                        className="btn-secondary"
                        style={{ border: '1px solid #444', color: '#888' }}
                    >
                        CLOSE / RESET
                    </button>
                </div>

                {/* Main Capture Area */}
                <div ref={summaryRef}
                    style={{
                        background: 'radial-gradient(circle at 50% 20%, #1e282d 0%, #091428 80%)',
                        position: 'relative',
                        padding: '40px',
                        border: '2px solid #c8aa6e',
                        boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                        minHeight: '800px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontFamily: "'Inter', 'Beaufort', sans-serif"
                    }}
                >
                    {/* 1. Header Title */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{
                            fontSize: '3rem',
                            color: '#f0e6d2',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            fontWeight: '800',
                            margin: 0,
                            textShadow: '0 4px 10px rgba(0,0,0,0.6)'
                        }}>
                            RESUMEN DE PARTIDAS
                        </h1>
                        <h2 style={{
                            fontSize: '1.2rem',
                            color: '#c8aa6e',
                            textTransform: 'uppercase',
                            letterSpacing: '6px',
                            marginTop: '10px',
                            opacity: 0.8,
                            fontWeight: '400'
                        }}>/ LEAGUE OF LEGENDS</h2>
                    </div>

                    {/* 2. Scoreboard Banner */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '1000px',
                        marginBottom: '50px',
                        position: 'relative'
                    }}>
                        {/* Blue Side */}
                        <div style={{
                            flex: 1,
                            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 200, 200, 0.2) 100%)',
                            borderBottom: '2px solid #00c8c8',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '30px'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00c8c8', letterSpacing: '2px' }}>BLUE TEAM</span>
                        </div>

                        {/* Center Score */}
                        <div style={{
                            padding: '0 40px',
                            fontSize: '4rem',
                            fontWeight: '900',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            textShadow: '0 0 20px rgba(200, 170, 110, 0.5)'
                        }}>
                            <span>[{blueWins}</span>
                            <span style={{ color: '#c8aa6e', fontSize: '2rem' }}>-</span>
                            <span>{redWins}]</span>
                        </div>

                        {/* Red Side */}
                        <div style={{
                            flex: 1,
                            background: 'linear-gradient(90deg, rgba(255, 70, 85, 0.2) 0%, transparent 100%)',
                            borderBottom: '2px solid #ff4655',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingLeft: '30px'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4655', letterSpacing: '2px' }}>RED TEAM</span>
                        </div>
                    </div>

                    {/* 3. Match History */}
                    <div style={{ width: '100%', maxWidth: '800px', marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.3 }}></div>
                            <h3 style={{ color: '#f0e6d2', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', margin: 0 }}>HISTORIAL DE PARTIDAS</h3>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.3 }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {history.map((game, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '12px',
                                    background: game.winner === 'BLUE'
                                        ? 'linear-gradient(90deg, transparent, rgba(0, 200, 200, 0.1), transparent)'
                                        : 'linear-gradient(90deg, transparent, rgba(255, 70, 85, 0.1), transparent)',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <span style={{ color: '#c8aa6e', fontWeight: 'bold', marginRight: '10px' }}>PARTIDA {game.gameNumber}:</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: game.winner === 'BLUE' ? '#00c8c8' : '#ff4655',
                                        textTransform: 'uppercase'
                                    }}>
                                        {game.winner === 'BLUE' ? 'VICTORIA (BLUE)' : 'VICTORIA (RED)'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Champions Played Grid */}
                    <div style={{ width: '100%', marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.5 }}></div>
                            <div style={{ width: '10px', height: '10px', transform: 'rotate(45deg)', border: '1px solid #c8aa6e' }}></div>
                            <h3 style={{ color: '#f0e6d2', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem', margin: 0, padding: '0 20px' }}>CAMPEONES JUGADOS</h3>
                            <div style={{ width: '10px', height: '10px', transform: 'rotate(45deg)', border: '1px solid #c8aa6e' }}></div>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.5 }}></div>
                        </div>

                        {/* Blue Pool */}
                        <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '40px', display: 'flex', justifyContent: 'center', paddingTop: '20px', marginRight: '10px'
                            }}>
                                <div style={{
                                    width: '30px', height: '30px', border: '2px solid #00c8c8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#00c8c8', fontWeight: 'bold'
                                }}>B</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {bluePool.map(c => (
                                    <div key={c.id} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #333' }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)',
                                            color: '#fff', fontSize: '0.6rem', padding: '2px', textAlign: 'center', textTransform: 'uppercase'
                                        }}>{c.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Red Pool */}
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '40px', display: 'flex', justifyContent: 'center', paddingTop: '20px', marginRight: '10px'
                            }}>
                                <div style={{
                                    width: '30px', height: '30px', border: '2px solid #ff4655',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#ff4655', fontWeight: 'bold'
                                }}>R</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {redPool.map(c => (
                                    <div key={c.id} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #333' }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)',
                                            color: '#fff', fontSize: '0.6rem', padding: '2px', textAlign: 'center', textTransform: 'uppercase'
                                        }}>{c.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. Bans Grid */}
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.3 }}></div>
                            <h3 style={{ color: '#c8aa6e', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', margin: 0 }}>CAMPEONES BANEADOS</h3>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.3 }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', opacity: 0.8 }}>
                            {/* Blue Bans */}
                            <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid #555', paddingRight: '10px', marginRight: '10px' }}>
                                {blueBans.map(c => (
                                    <div key={c.id} style={{ width: '40px', height: '40px', border: '1px solid #ff4655', filter: 'grayscale(100%)' }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                            {/* Red Bans */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {redBans.map(c => (
                                    <div key={c.id} style={{ width: '40px', height: '40px', border: '1px solid #ff4655', filter: 'grayscale(100%)' }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="text-center text-gray-500 text-sm mt-4">
                    FEARLESS DRAFT - SERIES REPORT
                </div>
            </div>
        </div>
    );
};

export default SeriesSummary;
