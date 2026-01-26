// Achievements Screen - Display all achievements
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { AchievementManager, ACHIEVEMENTS } from '../utils/AchievementManager';

const AchievementsScreen = ({ navigation }) => {
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        const allAchievements = await AchievementManager.getAllWithStatus();
        setAchievements(allAchievements);
        const prog = await AchievementManager.getProgress();
        setProgress(prog);
    };

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Başarımlar</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {unlockedCount}/{ACHIEVEMENTS.length} başarım ({progress}%)
                    </Text>
                </View>

                {/* Achievements List */}
                <ScrollView contentContainerStyle={styles.list}>
                    {achievements.map(achievement => (
                        <View
                            key={achievement.id}
                            style={[
                                styles.card,
                                achievement.unlocked && styles.unlockedCard,
                            ]}
                        >
                            <View style={[
                                styles.emojiContainer,
                                !achievement.unlocked && styles.lockedEmoji,
                            ]}>
                                <Text style={styles.emoji}>
                                    {achievement.unlocked ? achievement.emoji : '🔒'}
                                </Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={[
                                    styles.name,
                                    !achievement.unlocked && styles.lockedText,
                                ]}>
                                    {achievement.name}
                                </Text>
                                <Text style={styles.description}>
                                    {achievement.description}
                                </Text>
                                {achievement.unlocked && (
                                    <Text style={styles.reward}>
                                        💰 +{achievement.reward} coin
                                    </Text>
                                )}
                            </View>
                            {achievement.unlocked && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </GalaxyBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    backBtn: {
        fontSize: 28,
        color: theme.colors.white,
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    placeholder: {
        width: 44,
    },
    progressSection: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    progressBar: {
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.gold || '#fbbf24',
        borderRadius: 5,
    },
    progressText: {
        color: theme.colors.textDim,
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    list: {
        padding: 15,
        paddingBottom: 30,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    unlockedCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    emojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    lockedEmoji: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    emoji: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    name: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3,
    },
    lockedText: {
        color: theme.colors.textDim,
    },
    description: {
        color: theme.colors.textDim,
        fontSize: 13,
    },
    reward: {
        color: theme.colors.gold || '#fbbf24',
        fontSize: 12,
        marginTop: 4,
    },
    checkmark: {
        backgroundColor: theme.colors.success,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AchievementsScreen;
