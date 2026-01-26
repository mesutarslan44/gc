// Score and Achievement System for Galaxy Conquest

// Score calculation
export const SCORE_VALUES = {
    PLANET_CAPTURED: 100,
    ENEMY_DEFEATED: 50,
    LEVEL_COMPLETE: 500,
    PERFECT_WIN: 250, // No planets lost
    SPEED_BONUS: 200, // Complete in under 60 seconds
    POWER_UP_COLLECTED: 25,
};

// Achievements
export const ACHIEVEMENTS = [
    {
        id: 'first_victory',
        name: 'İlk Zafer',
        description: 'İlk seviyeyi tamamla',
        emoji: '🏆',
        unlocked: false,
        condition: (stats) => stats.levelsCompleted >= 1,
    },
    {
        id: 'conqueror',
        name: 'Fatih',
        description: '5 seviye tamamla',
        emoji: '👑',
        unlocked: false,
        condition: (stats) => stats.levelsCompleted >= 5,
    },
    {
        id: 'planet_hunter',
        name: 'Gezegen Avcısı',
        description: '20 gezegen ele geçir',
        emoji: '🌍',
        unlocked: false,
        condition: (stats) => stats.planetsCaptured >= 20,
    },
    {
        id: 'fleet_commander',
        name: 'Filo Komutanı',
        description: '100 gemi gönder',
        emoji: '🚀',
        unlocked: false,
        condition: (stats) => stats.shipsSent >= 100,
    },
    {
        id: 'speed_demon',
        name: 'Hız Şeytanı',
        description: 'Bir seviyeyi 30 saniyede tamamla',
        emoji: '⚡',
        unlocked: false,
        condition: (stats) => stats.fastestLevel <= 30000,
    },
    {
        id: 'perfect_general',
        name: 'Kusursuz General',
        description: 'Hiç gezegen kaybetmeden bir seviye tamamla',
        emoji: '💎',
        unlocked: false,
        condition: (stats) => stats.perfectWins >= 1,
    },
    {
        id: 'power_master',
        name: 'Güç Ustası',
        description: '10 power-up topla',
        emoji: '✨',
        unlocked: false,
        condition: (stats) => stats.powerUpsCollected >= 10,
    },
    {
        id: 'boss_slayer',
        name: 'Boss Katili',
        description: 'Bir boss\'u yen',
        emoji: '🐉',
        unlocked: false,
        condition: (stats) => stats.bossesDefeated >= 1,
    },
    {
        id: 'galaxy_emperor',
        name: 'Galaksi İmparatoru',
        description: 'Tüm seviyeleri tamamla',
        emoji: '🌟',
        unlocked: false,
        condition: (stats) => stats.levelsCompleted >= 10,
    },
    {
        id: 'unstoppable',
        name: 'Durdurulamaz',
        description: '5 seviyeyi art arda kazan',
        emoji: '🔥',
        unlocked: false,
        condition: (stats) => stats.winStreak >= 5,
    },
];

// Default player stats
export const DEFAULT_STATS = {
    totalScore: 0,
    highScore: 0,
    levelsCompleted: 0,
    planetsCaptured: 0,
    shipsSent: 0,
    powerUpsCollected: 0,
    bossesDefeated: 0,
    perfectWins: 0,
    fastestLevel: Infinity,
    winStreak: 0,
    currentStreak: 0,
    gamesPlayed: 0,
};

// Calculate score for a game
export const calculateGameScore = (gameData) => {
    let score = 0;

    score += gameData.planetsCaptured * SCORE_VALUES.PLANET_CAPTURED;
    score += gameData.enemiesDefeated * SCORE_VALUES.ENEMY_DEFEATED;
    score += gameData.powerUpsCollected * SCORE_VALUES.POWER_UP_COLLECTED;

    if (gameData.won) {
        score += SCORE_VALUES.LEVEL_COMPLETE;

        if (gameData.perfectWin) {
            score += SCORE_VALUES.PERFECT_WIN;
        }

        if (gameData.completionTime < 60000) {
            score += SCORE_VALUES.SPEED_BONUS;
        }
    }

    return score;
};

// Check and unlock achievements
export const checkAchievements = (stats, achievements) => {
    return achievements.map(achievement => ({
        ...achievement,
        unlocked: achievement.unlocked || achievement.condition(stats),
    }));
};

// Leaderboard entry
export const createLeaderboardEntry = (playerName, score, level) => ({
    id: `entry-${Date.now()}`,
    playerName,
    score,
    level,
    timestamp: Date.now(),
});
