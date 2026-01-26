import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { ProgressManager } from '../utils/ProgressManager';
import { DailyQuestManager } from '../utils/DailyQuestManager';
import { DailyRewardManager, DAILY_REWARDS } from '../utils/DailyRewardManager';

const HomeScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [progress, setProgress] = useState(null);
    const [dailyQuests, setDailyQuests] = useState([]);
    const [refreshTime, setRefreshTime] = useState('');
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [dailyRewardData, setDailyRewardData] = useState(null);

    useEffect(() => {
        loadData();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        // Refresh time countdown
        const interval = setInterval(() => {
            const time = DailyQuestManager.getTimeUntilRefresh();
            setRefreshTime(time.formatted);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const prog = await ProgressManager.getProgress();
        setProgress(prog);

        const quests = await DailyQuestManager.getQuests();
        setDailyQuests(quests);

        const time = DailyQuestManager.getTimeUntilRefresh();
        setRefreshTime(time.formatted);

        // Check daily reward
        const rewardStatus = await DailyRewardManager.checkReward();
        if (rewardStatus.available) {
            setDailyRewardData(rewardStatus);
            setShowDailyReward(true);
        }
    };

    const claimDailyReward = async () => {
        const result = await DailyRewardManager.claimReward();
        if (result.success) {
            await ProgressManager.addCoins(result.reward.coins);
            setShowDailyReward(false);
            loadData(); // Refresh data
            Alert.alert('🎁 Tebrikler!', `${result.reward.coins} coin kazandın! (Seri: ${result.streak} gün)`);
        }
    };

    const handleClaimQuest = async (questId) => {
        const result = await DailyQuestManager.claimReward(questId);
        if (result.success) {
            await ProgressManager.addCoins(result.reward);
            loadData();
        }
    };

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header with Settings */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Text style={styles.settingsIcon}>⚙️</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Bar */}
                    {progress && (
                        <View style={styles.statsBar}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>💰 {progress.coins}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>⭐ {progress.highScore}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>🏆 {progress.gamesWon}</Text>
                            </View>
                        </View>
                    )}

                    {/* Title */}
                    <Animated.View style={[styles.titleContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.emoji}>🚀🌌</Text>
                        <Text style={styles.title}>GALAKSİ</Text>
                        <Text style={styles.subtitle}>FATİHİ</Text>
                    </Animated.View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => navigation.navigate('LevelSelect')}
                            >
                                <Text style={styles.playButtonText}>🎮 OYNA</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Game', { levelId: progress?.highestLevelUnlocked || 1 })}
                        >
                            <Text style={styles.secondaryButtonText}>⚡ Hızlı Başla</Text>
                        </TouchableOpacity>

                        <View style={styles.bottomRow}>
                            <TouchableOpacity
                                style={styles.smallButton}
                                onPress={() => navigation.navigate('CustomGame')}
                            >
                                <Text style={styles.smallButtonText}>🎲 Özel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.shopButton}
                                onPress={() => navigation.navigate('Shop')}
                            >
                                <Text style={styles.shopButtonText}>🛒 Mağaza</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.achievementButton}
                                onPress={() => navigation.navigate('Achievements')}
                            >
                                <Text style={styles.achievementButtonText}>🏆</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statsButton}
                                onPress={() => navigation.navigate('Stats')}
                            >
                                <Text style={styles.statsButtonText}>📊</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Daily Quests */}
                    {dailyQuests.length > 0 && (
                        <View style={styles.questsSection}>
                            <View style={styles.questsHeader}>
                                <Text style={styles.questsTitle}>📅 Günlük Görevler</Text>
                                <Text style={styles.refreshTime}>🔄 {refreshTime}</Text>
                            </View>
                            {dailyQuests.map(quest => (
                                <View key={quest.id} style={styles.questCard}>
                                    <Text style={styles.questEmoji}>{quest.emoji}</Text>
                                    <View style={styles.questInfo}>
                                        <Text style={styles.questName}>{quest.name}</Text>
                                        <Text style={styles.questDesc}>{quest.description}</Text>
                                        <View style={styles.questProgress}>
                                            <View style={[
                                                styles.questProgressBar,
                                                { width: `${Math.min(quest.progress / quest.target * 100, 100)}%` }
                                            ]} />
                                        </View>
                                        <Text style={styles.questProgressText}>
                                            {quest.progress}/{quest.target}
                                        </Text>
                                    </View>
                                    {quest.completed && !quest.claimed ? (
                                        <TouchableOpacity
                                            style={styles.claimBtn}
                                            onPress={() => handleClaimQuest(quest.id)}
                                        >
                                            <Text style={styles.claimBtnText}>+{quest.reward} 💰</Text>
                                        </TouchableOpacity>
                                    ) : quest.claimed ? (
                                        <Text style={styles.claimedText}>✓</Text>
                                    ) : (
                                        <Text style={styles.rewardText}>+{quest.reward}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Footer */}
                    <Text style={styles.footer}>Galaksiyi fethet!</Text>
                </ScrollView>

                {/* Daily Reward Modal */}
                <Modal
                    visible={showDailyReward}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.rewardModal}>
                            <Text style={styles.rewardModalTitle}>🎁 Günlük Ödül!</Text>
                            {dailyRewardData?.reward && (
                                <>
                                    <Text style={styles.rewardDayText}>
                                        {dailyRewardData.reward.name}
                                    </Text>
                                    <Text style={styles.rewardAmount}>
                                        💰 {dailyRewardData.reward.coins} Coin
                                    </Text>
                                    <View style={styles.streakInfo}>
                                        <Text style={styles.streakText}>
                                            🔥 {dailyRewardData.currentStreak} günlük seri!
                                        </Text>
                                    </View>
                                </>
                            )}
                            <TouchableOpacity
                                style={styles.claimRewardBtn}
                                onPress={claimDailyReward}
                            >
                                <Text style={styles.claimRewardBtnText}>Ödülü Al!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </GalaxyBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    settingsBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    settingsIcon: {
        fontSize: 24,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    emoji: {
        fontSize: 60,
        textAlign: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textAlign: 'center',
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.colors.white,
        textAlign: 'center',
        marginTop: -5,
    },
    buttonContainer: {
        marginTop: 30,
        gap: 16,
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: 18,
        paddingHorizontal: 60,
        borderRadius: 30,
        elevation: 5,
    },
    playButtonText: {
        color: theme.colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: 18,
    },
    timedModeButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    timedModeButtonText: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomRow: {
        flexDirection: 'row',
        gap: 12,
    },
    smallButton: {
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ffa500',
    },
    smallButtonText: {
        color: '#ffa500',
        fontSize: 15,
        fontWeight: '600',
    },
    shopButton: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.purple,
    },
    shopButtonText: {
        color: theme.colors.purple,
        fontSize: 15,
        fontWeight: '600',
    },
    achievementButton: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    achievementButtonText: {
        fontSize: 18,
    },
    statsButton: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    statsButtonText: {
        fontSize: 18,
    },
    questsSection: {
        marginTop: 40,
    },
    questsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questsTitle: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    refreshTime: {
        color: theme.colors.textDim,
        fontSize: 12,
    },
    questCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    questEmoji: {
        fontSize: 28,
    },
    questInfo: {
        flex: 1,
    },
    questName: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    questDesc: {
        color: theme.colors.textDim,
        fontSize: 12,
        marginTop: 2,
    },
    questProgress: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginTop: 6,
        overflow: 'hidden',
    },
    questProgressBar: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 2,
    },
    questProgressText: {
        color: theme.colors.textDim,
        fontSize: 10,
        marginTop: 2,
    },
    claimBtn: {
        backgroundColor: theme.colors.success,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    claimBtnText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    claimedText: {
        color: theme.colors.success,
        fontSize: 20,
    },
    rewardText: {
        color: theme.colors.gold,
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        textAlign: 'center',
        color: theme.colors.textDim,
        fontSize: 14,
        marginTop: 30,
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardModal: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.gold || '#fbbf24',
        width: '85%',
    },
    rewardModalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginBottom: 20,
    },
    rewardDayText: {
        fontSize: 20,
        color: theme.colors.gold || '#fbbf24',
        fontWeight: '600',
        marginBottom: 10,
    },
    rewardAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginBottom: 15,
    },
    streakInfo: {
        backgroundColor: 'rgba(255,165,0,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    streakText: {
        color: '#ffa500',
        fontSize: 16,
        fontWeight: '600',
    },
    claimRewardBtn: {
        backgroundColor: theme.colors.gold || '#fbbf24',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
    },
    claimRewardBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
