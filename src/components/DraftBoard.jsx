import { useDraftStore } from '../logic/store';

const Slot = ({ type, side, index, champion, isActive }) => {
    return (
        <div className={`draft-slot ${type.toLowerCase()} ${side.toLowerCase()} ${isActive ? 'active' : ''}`}>
            {champion ? (
                <div className="champion-image-container">
                    <img
                        src={type === 'PICK' ? champion.centeredImage : champion.image}
                        alt={champion.name}
                        className="champion-img"
                    />
                    <div className="champion-name">{champion.name}</div>
                </div>
            ) : (
                <div className="empty-slot">
                    <span className="slot-label">{type}</span>
                </div>
            )}
        </div>
    );
};

const DraftBoard = () => {
    const { blueSide, redSide, getCurrentStep } = useDraftStore();
    const currentStep = getCurrentStep();

    const isSlotActive = (side, type, index) => {
        if (!currentStep) return false;
        return currentStep.side === side && currentStep.type === type && currentStep.index === index;
    };

    return (
        <div className="draft-board">
            {/* Blue Team */}
            <div className="team-column blue-team">
                <h2 className="team-name text-blue">BLUE TEAM</h2>

                <div className="picks-container">
                    {blueSide.picks.map((champ, i) => (
                        <Slot
                            key={`blue-pick-${i}`}
                            type="PICK"
                            side="BLUE"
                            index={i}
                            champion={champ}
                            isActive={isSlotActive('BLUE', 'PICK', i)}
                        />
                    ))}
                </div>

                <div className="bans-container">
                    <span className="bans-label">BANS</span>
                    <div className="bans-row">
                        {blueSide.bans.map((champ, i) => (
                            <Slot
                                key={`blue-ban-${i}`}
                                type="BAN"
                                side="BLUE"
                                index={i}
                                champion={champ}
                                isActive={isSlotActive('BLUE', 'BAN', i)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* VS / Timer Area */}
            <div className="vs-column">
                {/* Spacer to match team header */}
                <div className="vs-spacer-header"></div>

                {/* Centered VS text (mirrors picks container) */}
                <div className="vs-center">
                    <div className="vs-text">VS</div>
                </div>

                {/* Spacer to match bans container */}
                <div className="vs-spacer-bans"></div>
            </div>

            {/* Red Team */}
            <div className="team-column red-team">
                <h2 className="team-name text-red">RED TEAM</h2>

                <div className="picks-container">
                    {redSide.picks.map((champ, i) => (
                        <Slot
                            key={`red-pick-${i}`}
                            type="PICK"
                            side="RED"
                            index={i}
                            champion={champ}
                            isActive={isSlotActive('RED', 'PICK', i)}
                        />
                    ))}
                </div>

                <div className="bans-container">
                    <span className="bans-label">BANS</span>
                    <div className="bans-row">
                        {redSide.bans.map((champ, i) => (
                            <Slot
                                key={`red-ban-${i}`}
                                type="BAN"
                                side="RED"
                                index={i}
                                champion={champ}
                                isActive={isSlotActive('RED', 'BAN', i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DraftBoard;
