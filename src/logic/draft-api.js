
// Heuristic mapping from Riot "Tags" (Classes) to "Positions" (Roles)
const TAG_TO_ROLE_MAP = {
    "Fighter": ["Top", "Jungle"],
    "Tank": ["Top", "Jungle", "Support"],
    "Mage": ["Mid", "Support"],
    "Assassin": ["Mid", "Jungle"],
    "Marksman": ["ADC"],
    "Support": ["Support"]
};

// Exceptional overrides for common champions that don't fit the strict class mapping perfectly
// This improves the "feel" of the heuristics
import { CHAMPION_ROLES } from './championRoles';

export const fetchPatchVersion = async () => {
    try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await response.json();
        return versions[0]; // The first one is the latest
    } catch (error) {
        console.error("Failed to fetch patch version:", error);
        return "14.1.1"; // Fallback to a known safe version
    }
};

export const fetchChampions = async (version) => {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
        const data = await response.json();

        return Object.values(data.data).map(champ => {
            // Calculate roles
            let roles = new Set();

            // Apply Static Role Mapping first (Most accurate)
            const staticRoles = CHAMPION_ROLES[champ.id];
            if (staticRoles) {
                staticRoles.forEach(r => roles.add(r));
            } else {
                // Fallback to Heuristic Mapping based on Tags if not in static list
                champ.tags.forEach(tag => {
                    const mappedRoles = TAG_TO_ROLE_MAP[tag];
                    if (mappedRoles) {
                        mappedRoles.forEach(r => roles.add(r));
                    }
                });
            }

            // Ensure every champion has at least one role if somehow missed
            if (roles.size === 0) roles.add("Mid");

            // Special case for Fiddlesticks - the centered image URL requires "FiddleSticks" with capital S
            const centeredImageId = champ.id === 'Fiddlesticks' ? 'FiddleSticks' : champ.id;

            return {
                id: champ.id,
                key: champ.key,
                name: champ.name,
                roles: Array.from(roles),
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image.full}`,
                centeredImage: `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${centeredImageId}_0.jpg`,
                audio: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-choose-vo/${champ.key}.ogg`
            };
        });
    } catch (error) {
        console.error("Failed to fetch champions:", error);
        return [];
    }
};
