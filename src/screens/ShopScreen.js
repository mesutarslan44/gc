// Shop Screen - Buy ships and themes with coins
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { ProgressManager, UNLOCKABLES } from '../utils/ProgressManager';

const ShopScreen = ({ navigation }) => {
    const [coins, setCoins] = useState(0);
    const [unlocks, setUnlocks] = useState({ ships: ['default'], themes: ['default'] });
    const [activeTab, setActiveTab] = useState('ships');

    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        const progress = await ProgressManager.getProgress();
        setCoins(progress.coins || 0);
        const unlocksData = await ProgressManager.getUnlocks();
        setUnlocks(unlocksData);
    };

    const handlePurchase = async (item, type) => {
        if (unlocks[type]?.includes(item.id)) {
            Alert.alert('Bilgi', 'Bu zaten satın alındı!');
            return;
        }

        if (coins < item.cost) {
            Alert.alert('Yetersiz Bakiye', `${item.cost - coins} coin daha gerekiyor!`);
            return;
        }

        Alert.alert(
            'Satın Al',
            `${item.name} için ${item.cost} coin harcamak istiyor musun?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Satın Al',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const result = await ProgressManager.purchaseUnlock(type, item.id, item.cost);
                        if (result.success) {
                            loadData();
                            Alert.alert('✅ Başarılı!', `${item.name} satın alındı!`);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = (item, type) => {
        const isOwned = unlocks[type]?.includes(item.id);
        const canAfford = coins >= item.cost;

        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.itemCard,
                    isOwned && styles.ownedCard,
                ]}
                onPress={() => !isOwned && handlePurchase(item, type)}
                disabled={isOwned}
            >
                <Text style={styles.itemEmoji}>{item.emoji || '🎨'}</Text>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {isOwned ? (
                        <Text style={styles.ownedText}>✓ Sahipsin</Text>
                    ) : (
                        <Text style={[
                            styles.itemCost,
                            !canAfford && styles.cantAfford,
                        ]}>
                            💰 {item.cost}
                        </Text>
                    )}
                </View>
                {!isOwned && (
                    <TouchableOpacity
                        style={[
                            styles.buyBtn,
                            !canAfford && styles.buyBtnDisabled,
                        ]}
                        onPress={() => handlePurchase(item, type)}
                        disabled={!canAfford}
                    >
                        <Text style={styles.buyBtnText}>
                            {canAfford ? 'AL' : '🔒'}
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Mağaza</Text>
                    <View style={styles.coinBadge}>
                        <Text style={styles.coinText}>💰 {coins}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        🎮 Seviyeleri tamamlayarak coin kazan!
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ships' && styles.activeTab]}
                        onPress={() => setActiveTab('ships')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ships' && styles.activeTabText]}>
                            🚀 Gemiler
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'themes' && styles.activeTab]}
                        onPress={() => setActiveTab('themes')}
                    >
                        <Text style={[styles.tabText, activeTab === 'themes' && styles.activeTabText]}>
                            🎨 Temalar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Items */}
                <ScrollView contentContainerStyle={styles.itemsGrid}>
                    {activeTab === 'ships' && UNLOCKABLES.ships.map(item => renderItem(item, 'ships'))}
                    {activeTab === 'themes' && UNLOCKABLES.themes.map(item => renderItem(item, 'themes'))}
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
    coinBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ffd700',
    },
    coinText: {
        color: '#ffd700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.3)',
    },
    infoText: {
        color: theme.colors.primary,
        fontSize: 13,
        textAlign: 'center',
    },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textDim,
        fontSize: 15,
        fontWeight: '600',
    },
    activeTabText: {
        color: theme.colors.white,
    },
    itemsGrid: {
        padding: 20,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    ownedCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    itemEmoji: {
        fontSize: 36,
        marginRight: 14,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemCost: {
        color: theme.colors.gold || '#fbbf24',
        fontSize: 14,
    },
    cantAfford: {
        color: theme.colors.textDim,
    },
    ownedText: {
        color: theme.colors.success,
        fontSize: 14,
    },
    buyBtn: {
        backgroundColor: theme.colors.success,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    buyBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    buyBtnText: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ShopScreen;
