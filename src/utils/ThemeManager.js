// Theme Manager - Multiple color themes for Galaxy Conquest

// Available themes
export const THEMES = {
    default: {
        id: 'default',
        name: 'Varsayılan',
        emoji: '🌌',
        colors: {
            primary: '#6366f1',
            secondary: '#818cf8',
            background: '#0a0a1a',
            player: '#22c55e',
            enemy: '#ef4444',
            neutral: '#6b7280',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#22c55e',
            warning: '#fbbf24',
            danger: '#ef4444',
            purple: '#a855f7',
            gold: '#fbbf24',
        },
    },
    nebula: {
        id: 'nebula',
        name: 'Nebula',
        emoji: '💜',
        colors: {
            primary: '#a855f7',
            secondary: '#c084fc',
            background: '#1a0a2e',
            player: '#22d3ee',
            enemy: '#f472b6',
            neutral: '#8b5cf6',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#22d3ee',
            warning: '#fbbf24',
            danger: '#f472b6',
            purple: '#a855f7',
            gold: '#fbbf24',
        },
    },
    solar: {
        id: 'solar',
        name: 'Güneş',
        emoji: '🌅',
        colors: {
            primary: '#f97316',
            secondary: '#fb923c',
            background: '#1a0f0a',
            player: '#fbbf24',
            enemy: '#ef4444',
            neutral: '#78716c',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#fbbf24',
            warning: '#f97316',
            danger: '#ef4444',
            purple: '#f97316',
            gold: '#fbbf24',
        },
    },
    ice: {
        id: 'ice',
        name: 'Buz',
        emoji: '❄️',
        colors: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            background: '#0a1a2e',
            player: '#06b6d4',
            enemy: '#f43f5e',
            neutral: '#64748b',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#06b6d4',
            warning: '#fbbf24',
            danger: '#f43f5e',
            purple: '#0ea5e9',
            gold: '#38bdf8',
        },
    },
    midnight: {
        id: 'midnight',
        name: 'Gece Yarısı',
        emoji: '🌙',
        colors: {
            primary: '#3b82f6',
            secondary: '#60a5fa',
            background: '#020617',
            player: '#10b981',
            enemy: '#f43f5e',
            neutral: '#475569',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#10b981',
            warning: '#fbbf24',
            danger: '#f43f5e',
            purple: '#8b5cf6',
            gold: '#fbbf24',
        },
    },
    storm: {
        id: 'storm',
        name: 'Uzay Fırtınası',
        emoji: '⚡',
        colors: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            background: '#0f0a1f',
            player: '#06b6d4',
            enemy: '#f59e0b',
            neutral: '#6366f1',
            white: '#ffffff',
            textDim: 'rgba(255, 255, 255, 0.6)',
            success: '#06b6d4',
            warning: '#f59e0b',
            danger: '#ef4444',
            purple: '#c084fc',
            gold: '#fbbf24',
        },
    },
    blackhole: {
        id: 'blackhole',
        name: 'Kara Delik',
        emoji: '🕳️',
        colors: {
            primary: '#7c3aed',
            secondary: '#9333ea',
            background: '#050505',
            player: '#a855f7',
            enemy: '#dc2626',
            neutral: '#3f3f46',
            white: '#e4e4e7',
            textDim: 'rgba(255, 255, 255, 0.5)',
            success: '#a855f7',
            warning: '#f97316',
            danger: '#dc2626',
            purple: '#7c3aed',
            gold: '#f97316',
        },
    },
};

// Types helper
export const getThemeById = (id) => {
    return THEMES[id] || THEMES.default;
};

export const getAllThemes = () => {
    return Object.values(THEMES);
};

const ThemeManager = {
    THEMES,
    getThemeById,
    getAllThemes,
};

export default ThemeManager;
