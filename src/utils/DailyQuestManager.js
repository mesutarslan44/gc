// Daily Quests System for Galaxy Conquest
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUESTS_KEY = '@galaxy_conquest_daily_quests';
const LAST_REFRESH_KEY = '@galaxy_conquest_last_refresh';

// Quest templates
const QUEST_TEMPLATES = [
    {
        id: 'capture_planets',
        type: 'capture',
        emoji: '🌍',
        name: 'Gezegen Avcısı',
        description: '{target} gezegen ele geçir',
        targets: [3, 5, 8, 10],
        rewards: [50, 100, 150, 200],
    },
    {
        id: 'collect_powerups',
        type: 'powerup',
        emoji: '✨',
        name: 'Güç Toplayıcı',
        description: '{target} power-up topla',
        targets: [2, 4, 6, 8],
        rewards: [40, 80, 120, 160],
    },
    {
        id: 'win_games',
        type: 'win',
        emoji: '🏆',
        name: 'Zafer Ustası',
        description: '{target} oyun kazan',
        targets: [1, 2, 3, 5],
        rewards: [75, 150, 225, 300],
    },
    {
        id: 'defeat_boss',
        type: 'boss',
        emoji: '👑',
        name: 'Boss Avcısı',
        description: 'Bir boss seviyesini tamamla',
        targets: [1],
        rewards: [200],
    },
    {
        id: 'send_ships',
        type: 'ships',
        emoji: '🚀',
        name: 'Filo Komutanı',
        description: '{target} gemi gönder',
        targets: [20, 50, 100],
        rewards: [30, 75, 150],
    },
    {
        id: 'complete_levels',
        type: 'levels',
        emoji: '⭐',
        name: 'Maceraperest',
        description: '{target} seviye tamamla',
        targets: [2, 4, 6],
        rewards: [60, 120, 180],
    },
];

// Generate random daily quests
const generateDailyQuests = () => {
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3); // Pick 3 random quests

    return selected.map(template => {
        const difficultyIndex = Math.floor(Math.random() * template.targets.length);
        const target = template.targets[difficultyIndex];
        const reward = template.rewards[difficultyIndex];

        return {
            ...template,
            target,
            reward,
            progress: 0,
            completed: false,
            claimed: false,
            description: template.description.replace('{target}', target.toString()),
        };
    });
};

// Check if quests need refresh (new day)
const shouldRefreshQuests = (lastRefresh) => {
    if (!lastRefresh) return true;

    const now = new Date();
    const last = new Date(lastRefresh);

    return now.getDate() !== last.getDate() ||
        now.getMonth() !== last.getMonth() ||
        now.getFullYear() !== last.getFullYear();
};

// Daily Quest Manager
export const DailyQuestManager = {
    async getQuests() {
        try {
            const lastRefresh = await AsyncStorage.getItem(LAST_REFRESH_KEY);

            if (shouldRefreshQuests(lastRefresh)) {
                // Generate new quests
                const newQuests = generateDailyQuests();
                await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(newQuests));
                await AsyncStorage.setItem(LAST_REFRESH_KEY, new Date().toISOString());
                return newQuests;
            }

            const stored = await AsyncStorage.getItem(QUESTS_KEY);
            return stored ? JSON.parse(stored) : generateDailyQuests();
        } catch (error) {
            console.log('Quest load error:', error);
            return generateDailyQuests();
        }
    },

    async updateProgress(questType, amount = 1) {
        try {
            const quests = await this.getQuests();

            const updatedQuests = quests.map(quest => {
                if (quest.type === questType && !quest.completed) {
                    const newProgress = quest.progress + amount;
                    return {
                        ...quest,
                        progress: newProgress,
                        completed: newProgress >= quest.target,
                    };
                }
                return quest;
            });

            await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(updatedQuests));
            return updatedQuests;
        } catch (error) {
            console.log('Quest update error:', error);
            return [];
        }
    },

    async claimReward(questId) {
        try {
            const quests = await this.getQuests();

            const quest = quests.find(q => q.id === questId && q.completed && !q.claimed);
            if (!quest) return { success: false, reward: 0 };

            const updatedQuests = quests.map(q =>
                q.id === questId ? { ...q, claimed: true } : q
            );

            await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(updatedQuests));
            return { success: true, reward: quest.reward };
        } catch (error) {
            console.log('Quest claim error:', error);
            return { success: false, reward: 0 };
        }
    },

    getTimeUntilRefresh() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, formatted: `${hours}s ${minutes}d` };
    },
};

export default DailyQuestManager;
