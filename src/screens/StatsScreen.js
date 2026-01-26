// Stats Screen - Display player statistics
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { ProgressManager } from '../utils/ProgressManager';

const StatsScreen = ({ navigation }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const progress = await ProgressManager.getProgress();
        setStats(progress);
        setLoading(false);
    };

    const formatTime = (ms) => {
        if (!ms) return '0s';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    if (loading) {
        return (
            <GalaxyBackground>
                <SafeAreaView style={styles.container}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </SafeAreaView>
            </GalaxyBackground>
        );
    }

    const levelsCompleted = stats?.levelsCompleted?.length || 0;
    const threeStarCount = Object.values(stats?.levelStars || {}).filter(s => s >= 3).length;
    const winRate = stats?.gamesPlayed > 0
        ? Math.round((stats?.gamesWon / stats?.gamesPlayed) * 100)
        : 0;

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>İstatistikler</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Overview Card */}
                    <View style={styles.overviewCard}>
                        <Text style={styles.overviewTitle}>📊 Genel Bakış</Text>
                        <View style={styles.overviewStats}>
                            <View style={styles.overviewItem}>
                                <Text style={styles.overviewValue}>{levelsCompleted}</Text>
                                <Text style={styles.overviewLabel}>Seviye</Text>
                            </View>
                            <View style={styles.overviewItem}>
                                <Text style={styles.overviewValue}>{stats?.coins || 0}</Text>
                                <Text style={styles.overviewLabel}>Coin</Text>
                            </View>
                            <View style={styles.overviewItem}>
                                <Text style={styles.overviewValue}>{winRate}%</Text>
                                <Text style={styles.overviewLabel}>Kazanma</Text>
                            </View>
                        </View>
                    </View>

                    {/* Detailed Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎮 Oyun İstatistikleri</Text>

                        <StatRow label="Toplam Oyun" value={stats?.gamesPlayed || 0} />
                        <StatRow label="Kazanılan" value={stats?.gamesWon || 0} emoji="✓" color="#22c55e" />
                        <StatRow label="Kaybedilen" value={(stats?.gamesPlayed || 0) - (stats?.gamesWon || 0)} emoji="✗" color="#ef4444" />
                        <StatRow label="En İyi Seri" value={stats?.bestWinStreak || 0} emoji="🔥" />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🌍 Gezegen İstatistikleri</Text>

                        <StatRow label="Fethedilen Gezegen" value={stats?.totalPlanetsCaptured || 0} />
                        <StatRow label="Gönderilen Gemi" value={stats?.totalShipsSent || 0} emoji="🚀" />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⭐ Seviye İstatistikleri</Text>

                        <StatRow label="Tamamlanan Seviye" value={levelsCompleted} />
                        <StatRow label="3 Yıldız Seviye" value={threeStarCount} emoji="⭐" color="#fbbf24" />
                        <StatRow label="En Yüksek Seviye" value={stats?.highestLevelUnlocked || 1} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚡ Power-up İstatistikleri</Text>

                        <StatRow label="Toplanan Power-up" value={stats?.totalPowerUpsCollected || 0} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⏱️ Süre İstatistikleri</Text>

                        <StatRow label="Toplam Oyun Süresi" value={formatTime(stats?.totalPlayTime || 0)} />
                        <StatRow label="En Hızlı Zafer" value={formatTime(stats?.fastestWin || 0)} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GalaxyBackground>
    );
};

// Stat Row Component
const StatRow = ({ label, value, emoji, color }) => (
    <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, color && { color }]}>
            {emoji && `${emoji} `}{value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingText: {
        color: theme.colors.white,
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
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
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    overviewCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    overviewTitle: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    overviewStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    overviewItem: {
        alignItems: 'center',
    },
    overviewValue: {
        color: theme.colors.white,
        fontSize: 32,
        fontWeight: 'bold',
    },
    overviewLabel: {
        color: theme.colors.textDim,
        fontSize: 13,
        marginTop: 4,
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    statLabel: {
        color: theme.colors.textDim,
        fontSize: 14,
    },
    statValue: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: '600',
    },
});

export default StatsScreen;
