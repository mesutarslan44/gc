// Progress & Save System for Galaxy Conquest
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@galaxy_conquest_progress';
const UNLOCKS_KEY = '@galaxy_conquest_unlocks';
const ACTIVE_KEY = '@galaxy_conquest_active';

// Default progress structure
export const DEFAULT_PROGRESS = {
    // Score & Stats
    totalScore: 0,
    highScore: 0,

    // Game Stats
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,

    // Level Progress
    highestLevelUnlocked: 1,
    levelsCompleted: [],
    levelStars: {}, // { levelId: stars (1-3) }

    // Gameplay Stats
    totalPlanetsCaptured: 0,
    totalShipsSent: 0,
    totalPowerUpsCollected: 0,
    totalBossesDefeated: 0,
    fastestLevelTime: {}, // { levelId: timeInMs }

    // Achievements
    unlockedAchievements: [],

    // Settings
    tutorialCompleted: false,
    soundEnabled: true,
    hapticEnabled: true,

    // Currency
    coins: 0,
    gems: 0,
};

// Unlockable content - UPDATED PRICES (4x)
export const UNLOCKABLES = {
    ships: [
        { id: 'default', name: 'Standart Gemi', emoji: '🚀', unlocked: true, cost: 0 },
        { id: 'fighter', name: 'Savaşçı', emoji: '✈️', unlocked: false, cost: 6000 },
        { id: 'cruiser', name: 'Kruvazör', emoji: '🛸', unlocked: false, cost: 12000 },
        { id: 'battleship', name: 'Savaş Gemisi', emoji: '🚢', unlocked: false, cost: 20000 },
        { id: 'stealth', name: 'Hayalet', emoji: '👻', unlocked: false, cost: 32000 },
        { id: 'starfighter', name: 'Yıldız Savaşçısı', emoji: '⭐', unlocked: false, cost: 44000 },
        { id: 'titan', name: 'Galaktik Titan', emoji: '🔱', unlocked: false, cost: 60000 },
    ],
    themes: [
        { id: 'default', name: 'Galaksi', emoji: '🌌', unlocked: true, cost: 0 },
        { id: 'nebula', name: 'Nebula', emoji: '💜', unlocked: false, cost: 8000 },
        { id: 'solar', name: 'Güneş', emoji: '🌅', unlocked: false, cost: 14000 },
        { id: 'ice', name: 'Buz', emoji: '❄️', unlocked: false, cost: 20000 },
        { id: 'midnight', name: 'Gece Yarısı', emoji: '🌙', unlocked: false, cost: 30000 },
        { id: 'storm', name: 'Uzay Fırtınası', emoji: '⚡', unlocked: false, cost: 40000 },
        { id: 'blackhole', name: 'Kara Delik', emoji: '🕳️', unlocked: false, cost: 56000 },
    ],
};

// Progress Manager
export const ProgressManager = {
    async getProgress() {
        try {
            const stored = await AsyncStorage.getItem(PROGRESS_KEY);
            if (stored) {
                return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
            }
            return DEFAULT_PROGRESS;
        } catch (error) {
            console.log('Progress load error:', error);
            return DEFAULT_PROGRESS;
        }
    },

    async saveProgress(updates) {
        try {
            const current = await this.getProgress();
            const updated = { ...current, ...updates };
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.log('Progress save error:', error);
            return null;
        }
    },

    async recordGameResult(result) {
        const current = await this.getProgress();

        const updates = {
            gamesPlayed: current.gamesPlayed + 1,
            totalPlanetsCaptured: current.totalPlanetsCaptured + result.planetsCaptured,
            totalShipsSent: current.totalShipsSent + result.shipsSent,
            totalPowerUpsCollected: current.totalPowerUpsCollected + result.powerUpsCollected,
            totalScore: current.totalScore + result.score,
            highScore: Math.max(current.highScore, result.score),
            coins: current.coins + result.score,
        };

        if (result.won) {
            updates.gamesWon = current.gamesWon + 1;
            updates.currentWinStreak = current.currentWinStreak + 1;
            updates.bestWinStreak = Math.max(current.bestWinStreak, updates.currentWinStreak);

            // Level completion
            if (result.levelId && !current.levelsCompleted.includes(result.levelId)) {
                updates.levelsCompleted = [...current.levelsCompleted, result.levelId];
                updates.highestLevelUnlocked = Math.max(current.highestLevelUnlocked, result.levelId + 1);
            }

            // Fastest time
            if (result.levelId && result.completionTime) {
                const currentFastest = current.fastestLevelTime[result.levelId];
                if (!currentFastest || result.completionTime < currentFastest) {
                    updates.fastestLevelTime = {
                        ...current.fastestLevelTime,
                        [result.levelId]: result.completionTime,
                    };
                }
            }

            // Boss defeated
            if (result.isBossLevel) {
                updates.totalBossesDefeated = current.totalBossesDefeated + 1;
            }

            // Calculate stars (1-3 based on performance)
            let stars = 1;
            if (result.completionTime < 60000) stars = 3; // Under 1 minute
            else if (result.completionTime < 120000) stars = 2; // Under 2 minutes

            updates.levelStars = {
                ...current.levelStars,
                [result.levelId]: Math.max(current.levelStars[result.levelId] || 0, stars),
            };
        } else {
            updates.gamesLost = current.gamesLost + 1;
            updates.currentWinStreak = 0;
        }

        return this.saveProgress(updates);
    },

    async markTutorialComplete() {
        return this.saveProgress({ tutorialCompleted: true });
    },

    async addCoins(amount) {
        const current = await this.getProgress();
        return this.saveProgress({ coins: current.coins + amount });
    },

    async spendCoins(amount) {
        const current = await this.getProgress();
        if (current.coins < amount) return { success: false, newBalance: current.coins };

        await this.saveProgress({ coins: current.coins - amount });
        return { success: true, newBalance: current.coins - amount };
    },

    async getUnlocks() {
        try {
            const stored = await AsyncStorage.getItem(UNLOCKS_KEY);
            return stored ? JSON.parse(stored) : { ships: ['default'], themes: ['default'] };
        } catch (error) {
            return { ships: ['default'], themes: ['default'] };
        }
    },

    async purchaseUnlock(type, itemId, cost) {
        const { success } = await this.spendCoins(cost);
        if (!success) return { success: false, message: 'Yetersiz bakiye!' };

        const unlocks = await this.getUnlocks();
        unlocks[type] = [...(unlocks[type] || []), itemId];

        await AsyncStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
        return { success: true, message: 'Satın alındı!' };
    },

    async getActive() {
        try {
            const stored = await AsyncStorage.getItem(ACTIVE_KEY);
            return stored ? JSON.parse(stored) : { ship: 'default', theme: 'default' };
        } catch (error) {
            return { ship: 'default', theme: 'default' };
        }
    },

    async setActive(type, itemId) {
        try {
            const active = await this.getActive();
            active[type] = itemId;
            await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    async resetProgress() {
        try {
            await AsyncStorage.removeItem(PROGRESS_KEY);
            await AsyncStorage.removeItem(UNLOCKS_KEY);
            await AsyncStorage.removeItem(ACTIVE_KEY);
            return true;
        } catch (error) {
            console.log('Reset error:', error);
            return false;
        }
    },
};

export default ProgressManager;
