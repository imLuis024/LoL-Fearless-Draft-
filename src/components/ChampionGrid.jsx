import { useState, useMemo } from 'react';
import { useDraftStore } from '../logic/store';
import { CHAMPIONS, getChampionImage } from '../logic/champions';

const ROLES = ["Top", "Jungle", "Mid", "Adc", "Support"];

const ChampionGrid = () => {
    const { selectChampion, isChampionDisabled, currentStepIndex } = useDraftStore();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(null);

    const filteredChampions = useMemo(() => {
        return CHAMPIONS.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter ? c.roles.includes(roleFilter) : true;
            return matchesSearch && matchesRole;
        });
    }, [search, roleFilter]);

    const handleSelect = (champion) => {
        const { disabled } = isChampionDisabled(champion.id);
        if (!disabled) {
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
                {filteredChampions.map(champ => {
                    const { disabled, reason } = isChampionDisabled(champ.id);
                    return (
                        <div
                            key={champ.id}
                            className={`champion-card ${disabled ? 'disabled' : ''}`}
                            onClick={() => handleSelect(champ)}
                        >
                            <img src={getChampionImage(champ.id)} alt={champ.name} loading="lazy" />
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
