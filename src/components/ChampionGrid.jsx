import { useState, useMemo } from 'react';
import { useDraftStore } from '../logic/store';

const ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"];

// Special "None" champion for skipping bans
// This champion has unique properties:
// - Only available during BAN phase
// - Can be selected multiple times by both teams (no Fearless restriction)
// - Does not play audio or count as a normal champion
const NONE_CHAMPION = {
    id: -1,
    name: 'None',
    image: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png',
    key: null,
    roles: []
};

const ChampionGrid = () => {
    const {
        selectChampion,
        isChampionDisabled,
        champions,
        isLoading,
        error,
        audioLanguage,
        getCurrentStep
    } = useDraftStore();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(null);

    const currentStep = getCurrentStep();
    const isBanPhase = currentStep && currentStep.type === 'BAN';

    const filteredChampions = useMemo(() => {
        return champions.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
            // Role filter: Check if the champion's calculated roles include the selected filter
            // Note: API "Bot" role is often "Bottom" or mapped from Marksman. 
            // Our map uses "Top", "Jungle", "Mid", "Bot", "Support"
            const matchesRole = roleFilter ? c.roles.includes(roleFilter) : true;
            return matchesSearch && matchesRole;
        });
    }, [champions, search, roleFilter]);

    if (isLoading) return <div className="loading-state">Loading Champions...</div>;
    if (error) return <div className="error-state">{error}</div>;

    const handleSelect = (champion) => {
        const { disabled } = isChampionDisabled(champion.id);
        if (!disabled) {
            // Play audio if available
            if (champion.key) {
                try {
                    const lang = audioLanguage || 'default';
                    // Use dynamic URL based on language
                    const audioUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${lang}/v1/champion-choose-vo/${champion.key}.ogg`;

                    const audio = new Audio(audioUrl);
                    audio.volume = 0.4;
                    audio.play().catch(e => console.error("Audio play failed:", e));
                } catch (e) {
                    console.error("Audio setup failed:", e);
                }
            }
            selectChampion(champion);
        }
    };

    return (
        <div className="champion-grid-container h-full flex flex-col">
            {/* Controls */}
            <div className="grid-controls">
                <input
                    type="text"
                    placeholder="Search Champion..."
                    className="search-input glass-panel"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="role-filters">
                    <button
                        className={`role-btn ${!roleFilter ? 'active' : ''}`}
                        onClick={() => setRoleFilter(null)}
                    >
                        ALL
                    </button>
                    {ROLES.map(role => (
                        <button
                            key={role}
                            className={`role-btn ${roleFilter === role ? 'active' : ''}`}
                            onClick={() => setRoleFilter(role)}
                        >
                            {role.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="champions-list">
                {/* Show "None" option only during BAN phase */}
                {isBanPhase && (
                    <div
                        key={NONE_CHAMPION.id}
                        className="champion-card none-option"
                        onClick={() => handleSelect(NONE_CHAMPION)}
                    >
                        <img src={NONE_CHAMPION.image} alt={NONE_CHAMPION.name} loading="lazy" />
                        <div className="champion-name-overlay">{NONE_CHAMPION.name}</div>
                    </div>
                )}

                {filteredChampions.map(champ => {
                    const { disabled, reason } = isChampionDisabled(champ.id);
                    return (
                        <div
                            key={champ.id}
                            className={`champion-card ${disabled ? 'disabled' : ''}`}
                            onClick={() => handleSelect(champ)}
                        >
                            <img src={champ.image} alt={champ.name} loading="lazy" />
                            <div className="champion-name-overlay">{champ.name}</div>

                            {disabled && (
                                <div className="disabled-overlay">
                                    {reason === 'CURRENT' && <span className="reason-ban">BANNED/PICKED</span>}
                                    {reason === 'FEARLESS' && <span className="reason-fearless">FEARLESS</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChampionGrid;
