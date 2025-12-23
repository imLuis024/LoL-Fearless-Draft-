import { useRef, useState } from 'react';
import { useDraftStore } from '../logic/store';
import { TRANSLATIONS } from '../logic/translations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SeriesSummary = ({ isOpen }) => {
    const { history, uiLanguage } = useDraftStore();
    const summaryRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const t = TRANSLATIONS[uiLanguage] || TRANSLATIONS.en;

    if (!isOpen) return null;

    // Calculate Stats
    const blueWins = history.filter(h => h.winner === 'BLUE').length;
    const redWins = history.filter(h => h.winner === 'RED').length;

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
                if (b && !all.find(existing => existing.id === b.id)) {
                    all.push(b);
                }
            });
        });
        return all;
    };

    const bluePool = getUniqueChamps(history, 'BLUE');
    const redPool = getUniqueChamps(history, 'RED');
    const blueBans = getUniqueBans(history, 'BLUE');
    const redBans = getUniqueBans(history, 'RED');

    // Export Logic
    const generateCanvas = async () => {
        if (!summaryRef.current) return null;

        const element = summaryRef.current;

        // Get the full dimensions including borders
        const rect = element.getBoundingClientRect();
        const width = element.offsetWidth;  // includes border
        const height = element.offsetHeight; // includes border

        // Add extra padding to ensure borders are captured
        const padding = 10;

        return await html2canvas(element, {
            backgroundColor: '#091428',
            scale: 2, // High res
            useCORS: true,
            logging: false,
            width: width + padding,
            height: height + padding,
            windowWidth: width + padding,
            windowHeight: height + padding,
            x: -padding / 2,
            y: -padding / 2,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector('[data-summary-ref="true"]');
                if (clonedElement) {
                    // Ensure the element is fully visible in the clone
                    clonedElement.style.position = 'relative';
                    clonedElement.style.display = 'flex';
                    clonedElement.style.overflow = 'visible';
                }
            }
        });
    };

    const handleDownloadImage = async () => {
        setIsExporting(true);
        try {
            const canvas = await generateCanvas();
            if (canvas) {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `fearless-draft-series-${new Date().getTime()}.png`;
                link.click();
            }
        } catch (err) {
            console.error(err);
        }
        setIsExporting(false);
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const canvas = await generateCanvas();
            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // Create PDF with same dimensions as canvas to maintain quality
                const pdf = new jsPDF({
                    orientation: imgWidth > imgHeight ? 'l' : 'p',
                    unit: 'px',
                    format: [imgWidth * 0.75, imgHeight * 0.75] // Scale down slightly for PDF viewer comfort
                });

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * 0.75, imgHeight * 0.75);
                pdf.save(`fearless-draft-series-${new Date().getTime()}.pdf`);
            }
        } catch (err) {
            console.error(err);
        }
        setIsExporting(false);
    };

    const handleCopyToClipboard = async () => {
        setIsExporting(true);
        try {
            const canvas = await generateCanvas();
            if (canvas) {
                canvas.toBlob(blob => {
                    if (blob) {
                        navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]).then(() => {
                            setCopyFeedback(true);
                            setTimeout(() => setCopyFeedback(false), 2000);
                        });
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
        setIsExporting(false);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-[#091428] custom-scrollbar"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2000,
                background: '#091428',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'scroll', // CRITICAL: inline style needed to override defaults
            }}
        >
            {/* Centered Content Wrapper */}
            <div style={{
                margin: 'auto', // Magic of flexbox: centers if plenty of space, top-aligns if scrolling
                paddingTop: '80px',
                paddingBottom: '80px',
                paddingLeft: '20px',  // Critical: prevents left/right borders from being clipped
                paddingRight: '20px', // Critical: prevents left/right borders from being clipped
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                minHeight: 'min-content'
            }}>

                {/* Floating Controls (Top Right) - FIXED position relative to screen */}
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '25px', // Shifted slightly more inward
                    zIndex: 2200, // Higher than everything
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }} className="print:hidden">

                    {/* Action Bar */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(16, 20, 30, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(200, 170, 110, 0.2)',
                        borderRadius: '8px',
                        padding: '4px',
                        gap: '4px'
                    }}>
                        <button
                            title={t.COPY_CLIPBOARD}
                            onClick={handleCopyToClipboard}
                            className="nav-icon-btn"
                            style={{
                                width: '40px', height: '40px',
                                border: 'none', background: 'transparent',
                                color: copyFeedback ? '#4ade80' : '#c8aa6e',
                                fontSize: '1.2rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                                borderRadius: '4px'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {copyFeedback ? '✓' : '📋'}
                        </button>

                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>

                        <button
                            title={t.DOWNLOAD_IMG}
                            onClick={handleDownloadImage}
                            style={{
                                height: '40px', padding: '0 12px',
                                border: 'none', background: 'transparent',
                                color: '#f0e6d2', fontFamily: 'Beaufort', fontWeight: 'bold',
                                cursor: 'pointer', letterSpacing: '1px', fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                borderRadius: '4px'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            IMG
                        </button>

                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>

                        <button
                            title={t.DOWNLOAD_PDF}
                            onClick={handleDownloadPDF}
                            style={{
                                height: '40px', padding: '0 12px',
                                border: 'none', background: 'transparent',
                                color: '#f0e6d2', fontFamily: 'Beaufort', fontWeight: 'bold',
                                cursor: 'pointer', letterSpacing: '1px', fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                borderRadius: '4px'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            PDF
                        </button>

                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>

                        {/* Beer / Support - Discreet */}
                        <a
                            href="https://www.buymeacoffee.com/tinoco"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t.BUY_ME_BEER}
                            style={{
                                width: '40px', height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                textDecoration: 'none', fontSize: '1.2rem',
                                opacity: 0.7, transition: 'opacity 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '1'}
                            onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                        >
                            🍺
                        </a>
                    </div>

                    {/* New Series Button - Separate and Primary Action */}
                    <button
                        onClick={() => {
                            if (confirm(t.NEW_SERIES_CONFIRM)) window.location.reload();
                        }}
                        style={{
                            height: '48px', // Slightly taller to match the group
                            padding: '0 20px',
                            background: '#c8aa6e',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#091428',
                            fontFamily: 'Beaufort, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(200, 170, 110, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 170, 110, 0.5)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(200, 170, 110, 0.3)';
                        }}
                    >
                        {t.NEW_SERIES}
                    </button>
                </div>

                {/* Main Capture Area */}
                <div ref={summaryRef} data-summary-ref="true"
                    style={{
                        width: '100%',
                        maxWidth: '1200px',
                        background: 'radial-gradient(circle at 50% 20%, #1e282d 0%, #091428 80%)',
                        position: 'relative',
                        padding: '40px',
                        border: '2px solid #c8aa6e',
                        boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontFamily: "'Inter', 'Beaufort', sans-serif",
                        flexShrink: 0,
                        boxSizing: 'border-box' // Ensure border is included in width
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
                            {t.SERIES_SUMMARY}
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
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00c8c8', letterSpacing: '2px' }}>{t.BLUE_TEAM}</span>
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
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4655', letterSpacing: '2px' }}>{t.RED_TEAM}</span>
                        </div>
                    </div>

                    {/* 3. Match History */}
                    <div style={{ width: '100%', maxWidth: '800px', marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ height: '1px', background: '#c8aa6e', flex: 1, opacity: 0.3 }}></div>
                            <h3 style={{ color: '#f0e6d2', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', margin: 0 }}>{t.MATCH_HISTORY}</h3>
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
                                    <span style={{ color: '#c8aa6e', fontWeight: 'bold', marginRight: '10px' }}>{t.GAME} {game.gameNumber}:</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: game.winner === 'BLUE' ? '#00c8c8' : '#ff4655',
                                        textTransform: 'uppercase'
                                    }}>
                                        {game.winner === 'BLUE' ? t.VICTORY_BLUE : t.VICTORY_RED}
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
                            <h3 style={{ color: '#f0e6d2', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem', margin: 0, padding: '0 20px' }}>{t.CHAMPIONS_PLAYED}</h3>
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
                                    <div key={c.id} style={{
                                        position: 'relative',
                                        width: '80px',
                                        height: '80px',
                                        border: '2px solid #c8aa6e',
                                        boxSizing: 'border-box',
                                        background: '#0a0a0c'
                                    }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)',
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
                                    <div key={c.id} style={{
                                        position: 'relative',
                                        width: '80px',
                                        height: '80px',
                                        border: '2px solid #c8aa6e',
                                        boxSizing: 'border-box',
                                        background: '#0a0a0c'
                                    }}>
                                        <img src={c.image} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)',
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
                            <h3 style={{ color: '#c8aa6e', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', margin: 0 }}>{t.CHAMPIONS_BANNED}</h3>
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

                    <div className="text-center text-gray-500 text-sm mt-8 opacity-50">
                        FEARLESS DRAFT - SERIES REPORT
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeriesSummary;
