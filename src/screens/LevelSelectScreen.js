import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { LEVELS } from '../game/levels';
import { ProgressManager } from '../utils/ProgressManager';

const LevelSelectScreen = ({ navigation }) => {
    const [progress, setProgress] = useState(null);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [levelStars, setLevelStars] = useState({});

    useEffect(() => {
        loadProgress();

        // Refresh on focus
        const unsubscribe = navigation.addListener('focus', loadProgress);
        return unsubscribe;
    }, [navigation]);

    const loadProgress = async () => {
        const prog = await ProgressManager.getProgress();
        setProgress(prog);
        setCompletedLevels(prog.levelsCompleted || []);
        setLevelStars(prog.levelStars || {});
    };

    const handleLevelPress = (level) => {
        navigation.navigate('Game', { levelId: level.id });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return theme.colors.success;
            case 'medium': return theme.colors.warning;
            case 'hard': return theme.colors.secondary;
            case 'boss': return theme.colors.purple;
            default: return theme.colors.primary;
        }
    };

    const getDifficultyLabel = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'Kolay';
            case 'medium': return 'Orta';
            case 'hard': return 'Zor';
            case 'boss': return 'BOSS';
            default: return difficulty;
        }
    };

    const isLevelLocked = (levelId) => {
        // First level always unlocked
        if (levelId === 1) return false;
        // Unlock if previous level is completed
        return !completedLevels.includes(levelId - 1);
    };

    const renderStars = (levelId) => {
        const stars = levelStars[levelId] || 0;
        return (
            <View style={styles.stars}>
                {[1, 2, 3].map(i => (
                    <Text key={i} style={[styles.star, i <= stars && styles.starFilled]}>
                        ★
                    </Text>
                ))}
            </View>
        );
    };

    const completedCount = completedLevels.length;
    const totalCount = LEVELS.length;

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Seviyeler</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(completedCount / totalCount) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {completedCount}/{totalCount} tamamlandı
                    </Text>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>📊 {totalCount} Seviye</Text>
                    <Text style={styles.statsText}>⭐ {LEVELS.filter(l => l.isBossLevel).length} Boss</Text>
                    <Text style={styles.statsText}>💰 {progress?.coins || 0}</Text>
                </View>

                {/* Level Grid */}
                <ScrollView contentContainerStyle={styles.grid}>
                    {LEVELS.map((level) => {
                        const isCompleted = completedLevels.includes(level.id);
                        const isLocked = isLevelLocked(level.id);

                        return (
                            <TouchableOpacity
                                key={level.id}
                                style={[
                                    styles.levelCard,
                                    level.isBossLevel && styles.bossCard,
                                    isCompleted && styles.completedCard,
                                    isLocked && styles.lockedCard,
                                ]}
                                onPress={() => !isLocked && handleLevelPress(level)}
                                activeOpacity={isLocked ? 1 : 0.8}
                                disabled={isLocked}
                            >
                                {/* Completion checkmark */}
                                {isCompleted && (
                                    <View style={styles.checkmark}>
                                        <Text style={styles.checkmarkText}>✓</Text>
                                    </View>
                                )}

                                {/* Lock icon */}
                                {isLocked && (
                                    <View style={styles.lockOverlay}>
                                        <Text style={styles.lockIcon}>🔒</Text>
                                    </View>
                                )}

                                <View style={[
                                    styles.levelNumber,
                                    { borderColor: getDifficultyColor(level.difficulty) },
                                    level.isBossLevel && styles.bossNumber,
                                    isCompleted && styles.completedNumber,
                                ]}>
                                    <Text style={styles.levelNumberText}>
                                        {level.isBossLevel ? '👑' : level.id}
                                    </Text>
                                </View>
                                <View style={styles.levelInfo}>
                                    <Text style={[
                                        styles.levelName,
                                        level.isBossLevel && styles.bossName,
                                        isLocked && styles.lockedText,
                                    ]}>
                                        {level.name}
                                    </Text>
                                    <View style={styles.levelMeta}>
                                        <Text style={[
                                            styles.difficulty,
                                            { color: getDifficultyColor(level.difficulty) },
                                            isLocked && styles.lockedText,
                                        ]}>
                                            {getDifficultyLabel(level.difficulty)}
                                        </Text>
                                        {isCompleted && renderStars(level.id)}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
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
    progressSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.success,
        borderRadius: 4,
    },
    progressText: {
        color: theme.colors.textDim,
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 10,
    },
    statsText: {
        color: theme.colors.textDim,
        fontSize: 13,
    },
    grid: {
        padding: 15,
        paddingBottom: 30,
    },
    levelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    bossCard: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 1,
        borderColor: theme.colors.purple,
    },
    completedCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    lockedCard: {
        opacity: 0.5,
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 10,
        backgroundColor: theme.colors.success,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
    },
    lockIcon: {
        fontSize: 24,
    },
    levelNumber: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    bossNumber: {
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        borderColor: theme.colors.purple,
    },
    completedNumber: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },
    levelNumberText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    levelInfo: {
        flex: 1,
    },
    levelName: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 3,
    },
    bossName: {
        color: theme.colors.purple,
    },
    lockedText: {
        color: theme.colors.textDim,
    },
    levelMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    difficulty: {
        fontSize: 12,
        fontWeight: '600',
    },
    stars: {
        flexDirection: 'row',
    },
    star: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        marginLeft: 1,
    },
    starFilled: {
        color: theme.colors.gold || '#fbbf24',
    },
});

export default LevelSelectScreen;
