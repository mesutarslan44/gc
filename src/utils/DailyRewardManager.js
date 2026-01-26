// Daily Rewards System for Galaxy Conquest
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_REWARD_KEY = '@galaxy_conquest_daily_reward';

// Daily reward tiers (7-day cycle)
export const DAILY_REWARDS = [
    { day: 1, coins: 50, emoji: '🎁', name: 'Gün 1' },
    { day: 2, coins: 75, emoji: '🎁', name: 'Gün 2' },
    { day: 3, coins: 100, emoji: '🎁', name: 'Gün 3' },
    { day: 4, coins: 150, emoji: '🎁', name: 'Gün 4' },
    { day: 5, coins: 200, emoji: '🎁', name: 'Gün 5' },
    { day: 6, coins: 300, emoji: '🎁', name: 'Gün 6' },
    { day: 7, coins: 500, emoji: '🏆', name: 'Haftalık Bonus!' },
];

export const DailyRewardManager = {
    // Check if daily reward is available
    async checkReward() {
        try {
            const stored = await AsyncStorage.getItem(DAILY_REWARD_KEY);
            const now = new Date();
            const today = now.toDateString();

            if (stored) {
                const data = JSON.parse(stored);
                const lastClaim = new Date(data.lastClaimDate);
                const lastClaimDay = lastClaim.toDateString();

                // Already claimed today
                if (lastClaimDay === today) {
                    return {
                        available: false,
                        currentStreak: data.streak,
                        nextReward: DAILY_REWARDS[(data.streak) % 7],
                    };
                }

                // Check if streak continues (claimed yesterday)
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                if (lastClaimDay === yesterdayStr) {
                    // Streak continues
                    const newStreak = (data.streak % 7) + 1;
                    return {
                        available: true,
                        currentStreak: newStreak,
                        reward: DAILY_REWARDS[newStreak - 1],
                    };
                } else {
                    // Streak broken, reset to day 1
                    return {
                        available: true,
                        currentStreak: 1,
                        reward: DAILY_REWARDS[0],
                        streakBroken: true,
                    };
                }
            } else {
                // First time
                return {
                    available: true,
                    currentStreak: 1,
                    reward: DAILY_REWARDS[0],
                };
            }
        } catch (error) {
            console.log('Daily reward check error:', error);
            return { available: false, currentStreak: 0 };
        }
    },

    // Claim daily reward
    async claimReward() {
        try {
            const status = await this.checkReward();
            if (!status.available) {
                return { success: false, message: 'Bugün zaten aldın!' };
            }

            const now = new Date();
            await AsyncStorage.setItem(DAILY_REWARD_KEY, JSON.stringify({
                lastClaimDate: now.toISOString(),
                streak: status.currentStreak,
            }));

            return {
                success: true,
                reward: status.reward,
                streak: status.currentStreak,
            };
        } catch (error) {
            console.log('Daily reward claim error:', error);
            return { success: false, message: 'Hata oluştu' };
        }
    },

    // Get streak info
    async getStreakInfo() {
        try {
            const stored = await AsyncStorage.getItem(DAILY_REWARD_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return {
                    streak: data.streak,
                    lastClaimDate: data.lastClaimDate,
                };
            }
            return { streak: 0, lastClaimDate: null };
        } catch (error) {
            return { streak: 0, lastClaimDate: null };
        }
    },

    // Reset for testing
    async reset() {
        await AsyncStorage.removeItem(DAILY_REWARD_KEY);
    },
};

export default DailyRewardManager;
