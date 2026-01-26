// Achievement System for Galaxy Conquest
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACHIEVEMENTS_KEY = '@galaxy_conquest_achievements';

// Achievement definitions - 30 achievements total
export const ACHIEVEMENTS = [
    // === BEGINNER ACHIEVEMENTS (5) ===
    {
        id: 'first_victory',
        name: 'İlk Zafer',
        description: 'İlk seviyeyi tamamla',
        emoji: '🏆',
        requirement: { type: 'wins', value: 1 },
        reward: 100,
    },
    {
        id: 'getting_started',
        name: 'Başlangıç',
        description: '5 seviye tamamla',
        emoji: '🎮',
        requirement: { type: 'wins', value: 5 },
        reward: 150,
    },
    {
        id: 'apprentice',
        name: 'Çırak',
        description: '10 seviye kazan',
        emoji: '📚',
        requirement: { type: 'wins', value: 10 },
        reward: 200,
    },
    {
        id: 'veteran',
        name: 'Veteran',
        description: '25 seviye kazan',
        emoji: '🎖️',
        requirement: { type: 'wins', value: 25 },
        reward: 400,
    },
    {
        id: 'champion',
        name: 'Şampiyon',
        description: '50 seviye kazan',
        emoji: '🏅',
        requirement: { type: 'wins', value: 50 },
        reward: 800,
    },

    // === PLANET ACHIEVEMENTS (4) ===
    {
        id: 'planet_collector',
        name: 'Gezegen Toplayıcı',
        description: '50 gezegen fethet',
        emoji: '🌍',
        requirement: { type: 'planets', value: 50 },
        reward: 200,
    },
    {
        id: 'planet_master',
        name: 'Gezegen Ustası',
        description: '200 gezegen fethet',
        emoji: '🌎',
        requirement: { type: 'planets', value: 200 },
        reward: 500,
    },
    {
        id: 'planet_emperor',
        name: 'Gezegen İmparatoru',
        description: '500 gezegen fethet',
        emoji: '🪐',
        requirement: { type: 'planets', value: 500 },
        reward: 1000,
    },
    {
        id: 'planet_god',
        name: 'Galaksi Tanrısı',
        description: '1000 gezegen fethet',
        emoji: '👑',
        requirement: { type: 'planets', value: 1000 },
        reward: 2500,
    },

    // === LEVEL PROGRESS ACHIEVEMENTS (5) ===
    {
        id: 'level_10',
        name: 'Yolun Başı',
        description: 'Seviye 10\'u tamamla',
        emoji: '🎯',
        requirement: { type: 'level', value: 10 },
        reward: 300,
    },
    {
        id: 'level_30',
        name: 'Orta Yol',
        description: 'Seviye 30\'u tamamla',
        emoji: '🚀',
        requirement: { type: 'level', value: 30 },
        reward: 500,
    },
    {
        id: 'level_50',
        name: 'Yarı Yol',
        description: 'Seviye 50\'yi tamamla',
        emoji: '🌟',
        requirement: { type: 'level', value: 50 },
        reward: 1000,
    },
    {
        id: 'level_75',
        name: 'Son Düzlük',
        description: 'Seviye 75\'i tamamla',
        emoji: '💫',
        requirement: { type: 'level', value: 75 },
        reward: 1500,
    },
    {
        id: 'level_90',
        name: 'Galaksi Fatihi',
        description: 'Tüm 90 seviyeyi tamamla',
        emoji: '⭐',
        requirement: { type: 'level', value: 90 },
        reward: 3000,
    },

    // === BOSS ACHIEVEMENTS (3) ===
    {
        id: 'boss_slayer',
        name: 'Boss Avcısı',
        description: 'İlk boss\'u yen',
        emoji: '⚔️',
        requirement: { type: 'bosses', value: 1 },
        reward: 250,
    },
    {
        id: 'boss_master',
        name: 'Boss Ustası',
        description: '5 boss yen',
        emoji: '🗡️',
        requirement: { type: 'bosses', value: 5 },
        reward: 800,
    },
    {
        id: 'boss_legend',
        name: 'Boss Efsanesi',
        description: 'Tüm 9 boss\'u yen',
        emoji: '🐉',
        requirement: { type: 'bosses', value: 9 },
        reward: 2000,
    },

    // === STAR ACHIEVEMENTS (3) ===
    {
        id: 'star_collector',
        name: 'Yıldız Toplayıcı',
        description: '10 seviyeden 3 yıldız al',
        emoji: '⭐',
        requirement: { type: 'three_stars', value: 10 },
        reward: 500,
    },
    {
        id: 'perfectionist',
        name: 'Mükemmeliyetçi',
        description: '30 seviyeden 3 yıldız al',
        emoji: '🌟',
        requirement: { type: 'three_stars', value: 30 },
        reward: 1200,
    },
    {
        id: 'ultimate_star',
        name: 'Yıldız Ustası',
        description: '60 seviyeden 3 yıldız al',
        emoji: '✨',
        requirement: { type: 'three_stars', value: 60 },
        reward: 2500,
    },

    // === POWER-UP ACHIEVEMENTS (3) ===
    {
        id: 'power_user',
        name: 'Güç Kullanıcısı',
        description: '25 power-up kullan',
        emoji: '💪',
        requirement: { type: 'powerups', value: 25 },
        reward: 200,
    },
    {
        id: 'power_addict',
        name: 'Güç Bağımlısı',
        description: '100 power-up kullan',
        emoji: '⚡',
        requirement: { type: 'powerups', value: 100 },
        reward: 500,
    },
    {
        id: 'power_master',
        name: 'Güç Ustası',
        description: '250 power-up kullan',
        emoji: '🔥',
        requirement: { type: 'powerups', value: 250 },
        reward: 1000,
    },

    // === WIN STREAK ACHIEVEMENTS (3) ===
    {
        id: 'winning_streak',
        name: 'Kazanma Serisi',
        description: '5 oyunu arka arkaya kazan',
        emoji: '🔥',
        requirement: { type: 'streak', value: 5 },
        reward: 400,
    },
    {
        id: 'unstoppable',
        name: 'Durdurulamaz',
        description: '10 oyunu arka arkaya kazan',
        emoji: '💥',
        requirement: { type: 'streak', value: 10 },
        reward: 1000,
    },
    {
        id: 'invincible',
        name: 'Yenilmez',
        description: '15 oyunu arka arkaya kazan',
        emoji: '🛡️',
        requirement: { type: 'streak', value: 15 },
        reward: 2000,
    },

    // === SHIPS ACHIEVEMENTS (4) ===
    {
        id: 'fleet_commander',
        name: 'Filo Komutanı',
        description: '500 gemi gönder',
        emoji: '🚢',
        requirement: { type: 'ships', value: 500 },
        reward: 200,
    },
    {
        id: 'admiral',
        name: 'Amiral',
        description: '2000 gemi gönder',
        emoji: '⚓',
        requirement: { type: 'ships', value: 2000 },
        reward: 500,
    },
    {
        id: 'grand_admiral',
        name: 'Büyük Amiral',
        description: '5000 gemi gönder',
        emoji: '🎖️',
        requirement: { type: 'ships', value: 5000 },
        reward: 1000,
    },
    {
        id: 'fleet_master',
        name: 'Filo Ustası',
        description: '10000 gemi gönder',
        emoji: '🌌',
        requirement: { type: 'ships', value: 10000 },
        reward: 2000,
    },
];

// Achievement Manager
export const AchievementManager = {
    // Get unlocked achievements
    async getUnlocked() {
        try {
            const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.log('Achievement load error:', error);
            return [];
        }
    },

    // Save unlocked achievement
    async unlock(achievementId) {
        try {
            const unlocked = await this.getUnlocked();
            if (!unlocked.includes(achievementId)) {
                unlocked.push(achievementId);
                await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
                return true;
            }
            return false;
        } catch (error) {
            console.log('Achievement save error:', error);
            return false;
        }
    },

    // Check and unlock achievements based on progress
    async checkAchievements(progress) {
        const unlocked = await this.getUnlocked();
        const newlyUnlocked = [];

        for (const achievement of ACHIEVEMENTS) {
            if (unlocked.includes(achievement.id)) continue;

            const { type, value } = achievement.requirement;
            let currentValue = 0;

            switch (type) {
                case 'wins':
                    currentValue = progress.gamesWon || 0;
                    break;
                case 'planets':
                    currentValue = progress.totalPlanetsCaptured || 0;
                    break;
                case 'level':
                    currentValue = Math.max(...(progress.levelsCompleted || [0]));
                    break;
                case 'bosses':
                    currentValue = progress.totalBossesDefeated || 0;
                    break;
                case 'three_stars':
                    const stars = progress.levelStars || {};
                    currentValue = Object.values(stars).filter(s => s >= 3).length;
                    break;
                case 'powerups':
                    currentValue = progress.totalPowerUpsCollected || 0;
                    break;
                case 'streak':
                    currentValue = progress.bestWinStreak || 0;
                    break;
                case 'ships':
                    currentValue = progress.totalShipsSent || 0;
                    break;
            }

            if (currentValue >= value) {
                const wasUnlocked = await this.unlock(achievement.id);
                if (wasUnlocked) {
                    newlyUnlocked.push(achievement);
                }
            }
        }

        return newlyUnlocked;
    },

    // Get achievement by ID
    getAchievement(id) {
        return ACHIEVEMENTS.find(a => a.id === id);
    },

    // Get all achievements with unlock status
    async getAllWithStatus() {
        const unlocked = await this.getUnlocked();
        return ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlocked: unlocked.includes(achievement.id),
        }));
    },

    // Get progress percentage
    async getProgress() {
        const unlocked = await this.getUnlocked();
        return Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);
    },

    // Reset all achievements (for testing)
    async reset() {
        await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);
    },
};

export default AchievementManager;
