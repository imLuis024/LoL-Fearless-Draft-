export const TRANSLATIONS = {
    en: {
        NEXT_GAME: "NEXT GAME",
        DRAFT_COMPLETE: "DRAFT COMPLETE",
        RESET: "RESET",
        RESET_CONFIRM: "Are you sure you want to reset the series?",
        GAME: "GAME",
        SIDE: "SIDE",
        PICK: "PICK",
        BAN: "BAN",
        VICTORY_BLUE: "VICTORY (BLUE)",
        VICTORY_RED: "VICTORY (RED)",
        SERIES_SUMMARY: "SERIES SUMMARY",
        MATCH_HISTORY: "MATCH HISTORY",
        CHAMPIONS_PLAYED: "CHAMPIONS PLAYED",
        CHAMPIONS_BANNED: "CHAMPIONS BANNED",
        DOWNLOAD_IMG: "DOWNLOAD IMAGE",
        DOWNLOAD_PDF: "DOWNLOAD PDF",
        COPY_CLIPBOARD: "COPY CLIPBOARD",
        BUY_ME_BEER: "Buy me a beer",
        NEW_SERIES: "NEW SERIES",
        NEW_SERIES_CONFIRM: "Start new series?",
        WHO_WON: "WHO WON GAME",
        BLUE_TEAM: "BLUE TEAM",
        RED_TEAM: "RED TEAM",
        CONFIRM: "CONFIRM"
    },
    es: {
        NEXT_GAME: "SIGUIENTE PARTIDA",
        DRAFT_COMPLETE: "DRAFT COMPLETADO",
        RESET: "REINICIAR",
        RESET_CONFIRM: "¿Seguro que quieres reiniciar la serie?",
        GAME: "PARTIDA",
        SIDE: "LADO",
        PICK: "PICK",
        BAN: "BAN",
        VICTORY_BLUE: "VICTORIA (BLUE)",
        VICTORY_RED: "VICTORIA (RED)",
        SERIES_SUMMARY: "RESUMEN DE SERIE",
        MATCH_HISTORY: "HISTORIAL DE PARTIDAS",
        CHAMPIONS_PLAYED: "CAMPEONES JUGADOS",
        CHAMPIONS_BANNED: "CAMPEONES BANEADOS",
        DOWNLOAD_IMG: "DESCARGAR IMAGEN",
        DOWNLOAD_PDF: "DESCARGAR PDF",
        COPY_CLIPBOARD: "COPIAR PORTAPAPELES",
        BUY_ME_BEER: "Cómprame una cerveza",
        NEW_SERIES: "NUEVA SERIE",
        NEW_SERIES_CONFIRM: "¿Iniciar nueva serie?",
        WHO_WON: "¿QUIÉN GANÓ LA PARTIDA",
        BLUE_TEAM: "EQUIPO AZUL",
        RED_TEAM: "EQUIPO ROJO",
        CONFIRM: "CONFIRMAR"
    }
};

// Map browser locales to our supported UI languages
export const detectLanguage = () => {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('es')) return 'es';
    return 'en';
};

// Map browser locales to our Audio IDs
export const detectAudioLanguage = () => {
    const lang = navigator.language || navigator.userLanguage;
    const lower = lang.toLowerCase();

    if (lower === 'es-mx' || lower === 'es-419') return 'es_mx';
    if (lower.startsWith('es')) return 'es_es';
    if (lower === 'pt-br' || lower === 'pt') return 'pt_br';
    if (lower === 'ko') return 'ko_kr';
    if (lower === 'ja') return 'ja_jp';
    if (lower === 'fr') return 'fr_fr';
    if (lower === 'de') return 'de_de';
    if (lower === 'it') return 'it_it';
    if (lower === 'pl') return 'pl_pl';
    if (lower === 'ru') return 'ru_ru';
    if (lower === 'tr') return 'tr_tr';

    return 'default'; // en_us
};
