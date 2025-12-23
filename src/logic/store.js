import { create } from 'zustand';
import { fetchPatchVersion, fetchChampions } from './draft-api';

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
        try {
            const version = await fetchPatchVersion();
            const champions = await fetchChampions(version);
            set({ champions, version, isLoading: false });
        } catch (err) {
            set({ error: "Failed to load champions", isLoading: false });
        }
    },

    // Audio Language State
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
    // Each entry: { gameNumber: 1, picks: [], bans: [] }
    history: [],

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

    nextGame: (winner) => {
        const { gameCount, blueSide, redSide, history } = get();

        // Archive current game
        const gameRecord = {
            gameNumber: gameCount,
            picks: [...blueSide.picks, ...redSide.picks].filter(Boolean),
            bans: [...blueSide.bans, ...redSide.bans].filter(Boolean),
            bluePicks: [...blueSide.picks],
            redPicks: [...redSide.picks],
            blueBans: [...blueSide.bans],
            redBans: [...redSide.bans],
            winner: winner, // 'BLUE' or 'RED'
        };

        set({
            gameCount: gameCount + 1,
            currentStepIndex: 0,
            blueSide: { ...blueSide, bans: Array(5).fill(null), picks: Array(5).fill(null) },
            redSide: { ...redSide, bans: Array(5).fill(null), picks: Array(5).fill(null) },
            history: [...history, gameRecord],
        });
    },

    resetSeries: () => {
        set({
            gameCount: 1,
            currentStepIndex: 0,
            blueSide: { name: 'Blue Team', bans: Array(5).fill(null), picks: Array(5).fill(null) },
            redSide: { name: 'Red Team', bans: Array(5).fill(null), picks: Array(5).fill(null) },
            history: [],
        });
    },

    // Computed Check: Is champion available?
    isChampionDisabled: (championId) => {
        const { history, blueSide, redSide } = get();

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
