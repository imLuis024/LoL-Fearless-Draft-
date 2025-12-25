import { create } from 'zustand';
import { fetchPatchVersion, fetchChampions } from './draft-api';
import { detectLanguage, detectAudioLanguage } from './translations';

// Phases for a single game draft
// Simplified Pro Draft Order (Standard 10 ban system logic, adjusted for UI simplicity)
// We will follow a standard flow:
// B1 -> R1 -> B2 -> R2 -> B3 -> R3 (Phase 1 Bans)
// B1 -> R1 -> R2 -> B2 -> B3 -> R3 (Phase 1 Picks)
// R4 -> B4 -> R5 -> B5 (Phase 2 Bans)
// R4 -> B4 -> B5 -> R5 (Phase 2 Picks)

const DRAFT_ORDER = [
    // Phase 1 Bans (3 each)
    { type: 'BAN', side: 'BLUE', index: 0 },
    { type: 'BAN', side: 'RED', index: 0 },
    { type: 'BAN', side: 'BLUE', index: 1 },
    { type: 'BAN', side: 'RED', index: 1 },
    { type: 'BAN', side: 'BLUE', index: 2 },
    { type: 'BAN', side: 'RED', index: 2 },

    // Phase 1 Picks (3 Blues, 3 Reds)
    { type: 'PICK', side: 'BLUE', index: 0 },
    { type: 'PICK', side: 'RED', index: 0 },
    { type: 'PICK', side: 'RED', index: 1 },
    { type: 'PICK', side: 'BLUE', index: 1 },
    { type: 'PICK', side: 'BLUE', index: 2 },
    { type: 'PICK', side: 'RED', index: 2 },

    // Phase 2 Bans (2 each)
    { type: 'BAN', side: 'RED', index: 3 },
    { type: 'BAN', side: 'BLUE', index: 3 },
    { type: 'BAN', side: 'RED', index: 4 },
    { type: 'BAN', side: 'BLUE', index: 4 },

    // Phase 2 Picks (2 each)
    { type: 'PICK', side: 'RED', index: 3 },
    { type: 'PICK', side: 'BLUE', index: 3 },
    { type: 'PICK', side: 'BLUE', index: 4 },
    { type: 'PICK', side: 'RED', index: 4 },
];

export const useDraftStore = create((set, get) => ({
    gameCount: 1, // Current game number (1-5)
    currentStepIndex: 0, // Index in DRAFT_ORDER

    // API State
    champions: [],
    version: '',
    isLoading: false,
    error: null,

    // Actions
    loadChampions: async () => {
        set({ isLoading: true });
        // Auto-detect languages on first load
        const detectedUI = detectLanguage();
        const detectedAudio = detectAudioLanguage();
        set({ uiLanguage: detectedUI, audioLanguage: detectedAudio });

        try {
            const version = await fetchPatchVersion();
            const champions = await fetchChampions(version);
            set({ champions, version, isLoading: false });
        } catch (err) {
            set({ error: "Failed to load champions", isLoading: false });
        }
    },

    // Language State
    uiLanguage: 'en', // 'en' or 'es'
    setUiLanguage: (lang) => set({ uiLanguage: lang }),

    audioLanguage: 'default',
    setAudioLanguage: (lang) => set({ audioLanguage: lang }),

    // Current Game State
    blueSide: {
        name: 'Blue Team',
        bans: Array(5).fill(null),
        picks: Array(5).fill(null),
    },
    redSide: {
        name: 'Red Team',
        bans: Array(5).fill(null),
        picks: Array(5).fill(null),
    },

    // History of previous games for Fearless Logic
    // Each entry: { gameNumber: 1, winner: 'BLUE'/'RED', picks: [], bans: [], bluePicks: [], redPicks: [], blueBans: [], redBans: [] }
    history: [],

    // Series State
    isSeriesComplete: false,

    // Actions
    // Team Identity State
    team1IsBlue: true, // true = Team 1 is Blue, Team 2 is Red. false = Team 1 is Red, Team 2 is Blue.
    setTeam1IsBlue: (isBlue) => set({ team1IsBlue: isBlue }),

    // Actions
    selectChampion: (champion) => {
        const { currentStepIndex, blueSide, redSide } = get();
        if (currentStepIndex >= DRAFT_ORDER.length) return; // Draft complete

        const step = DRAFT_ORDER[currentStepIndex];
        const isBlue = step.side === 'BLUE';

        // Create new state arrays
        const newBlue = { ...blueSide, bans: [...blueSide.bans], picks: [...blueSide.picks] };
        const newRed = { ...redSide, bans: [...redSide.bans], picks: [...redSide.picks] };

        // Update the specific slot
        if (isBlue) {
            if (step.type === 'BAN') newBlue.bans[step.index] = champion;
            else newBlue.picks[step.index] = champion;
        } else {
            if (step.type === 'BAN') newRed.bans[step.index] = champion;
            else newRed.picks[step.index] = champion;
        }

        set({
            blueSide: newBlue,
            redSide: newRed,
            currentStepIndex: currentStepIndex + 1,
        });
    },

    nextGame: (winnerSide) => {
        const { gameCount, blueSide, redSide, history, team1IsBlue } = get();

        // Determine which Team corresponds to which Side
        // If team1IsBlue is true: Team 1 = Blue Side, Team 2 = Red Side
        // If team1IsBlue is false: Team 1 = Red Side, Team 2 = Blue Side

        let team1Picks, team1Bans, team2Picks, team2Bans;
        let winningTeam;

        if (team1IsBlue) {
            // Team 1 is Blue
            team1Picks = [...blueSide.picks].filter(Boolean);
            team1Bans = [...blueSide.bans].filter(Boolean);
            team2Picks = [...redSide.picks].filter(Boolean);
            team2Bans = [...redSide.bans].filter(Boolean);

            winningTeam = winnerSide === 'BLUE' ? 'TEAM1' : 'TEAM2';
        } else {
            // Team 1 is Red
            team1Picks = [...redSide.picks].filter(Boolean);
            team1Bans = [...redSide.bans].filter(Boolean);
            team2Picks = [...blueSide.picks].filter(Boolean);
            team2Bans = [...blueSide.bans].filter(Boolean);

            winningTeam = winnerSide === 'RED' ? 'TEAM1' : 'TEAM2';
        }

        // Archive current game
        const gameRecord = {
            gameNumber: gameCount,

            // Raw Side Data (keep for reference if needed)
            bluePicks: [...blueSide.picks].filter(Boolean),
            redPicks: [...redSide.picks].filter(Boolean),
            blueBans: [...blueSide.bans].filter(Boolean),
            redBans: [...redSide.bans].filter(Boolean),
            winnerSide: winnerSide, // 'BLUE' or 'RED'

            // Organized Team Data
            team1Picks,
            team1Bans,
            team2Picks,
            team2Bans,
            winningTeam, // 'TEAM1' or 'TEAM2'
            team1IsBlue, // Value of the state during this game

            // Combined for simplified history checks check
            picks: [...blueSide.picks, ...redSide.picks].filter(Boolean),
            bans: [...blueSide.bans, ...redSide.bans].filter(Boolean),
        };

        const newHistory = [...history, gameRecord];

        // Check Series Completion (First to 3 wins)
        const team1Wins = newHistory.filter(h => h.winningTeam === 'TEAM1').length;
        const team2Wins = newHistory.filter(h => h.winningTeam === 'TEAM2').length;
        const isSeriesOver = gameCount >= 5 || team1Wins >= 3 || team2Wins >= 3;

        if (isSeriesOver) {
            set({
                history: newHistory,
                isSeriesComplete: true
                // Do NOT increment gameCount or reset board
            });
        } else {
            set({
                gameCount: gameCount + 1,
                currentStepIndex: 0,
                blueSide: { ...blueSide, bans: Array(5).fill(null), picks: Array(5).fill(null) },
                redSide: { ...redSide, bans: Array(5).fill(null), picks: Array(5).fill(null) },
                history: newHistory,
            });
        }
    },

    resetSeries: () => {
        set({
            gameCount: 1,
            isSeriesComplete: false,
            currentStepIndex: 0,
            team1IsBlue: true,
            blueSide: { name: 'Blue Team', bans: Array(5).fill(null), picks: Array(5).fill(null) },
            redSide: { name: 'Red Team', bans: Array(5).fill(null), picks: Array(5).fill(null) },
            history: [],
        });
    },

    // Computed Check: Is champion available?
    isChampionDisabled: (championId) => {
        const { history, blueSide, redSide } = get();

        // Special case: "None" champion (id=-1) is always available during ban phase
        // It can be used multiple times by both teams
        if (championId === -1) return { disabled: false, reason: null };

        // 1. Check if picked/banned in CURRENT game
        const currentUsed = [
            ...blueSide.picks, ...blueSide.bans,
            ...redSide.picks, ...redSide.bans
        ].filter(Boolean);

        if (currentUsed.some(c => c.id === championId)) return { disabled: true, reason: 'CURRENT' };

        // 2. Check Fearless Rule (Previous Games' PICKS only)
        // Flatten all previous picks
        const previousPicks = history.flatMap(game => game.picks);
        if (previousPicks.some(c => c.id === championId)) return { disabled: true, reason: 'FEARLESS' };

        return { disabled: false, reason: null };
    },

    getCurrentStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex >= DRAFT_ORDER.length) return null;
        return DRAFT_ORDER[currentStepIndex];
    }
}));
