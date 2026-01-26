// Custom Game Screen - Create your own random levels
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GalaxyBackground from '../components/GalaxyBackground';
import theme from '../constants/theme';
import { ENEMY_TYPES, POWER_UP_TYPES } from '../game/powerUps';

const CustomGameScreen = ({ navigation }) => {
    // Game settings
    const [enemyCount, setEnemyCount] = useState(1);
    const [mapSize, setMapSize] = useState('medium');
    const [difficulty, setDifficulty] = useState('medium');
    const [neutralCount, setNeutralCount] = useState(4);
    const [freeForAll, setFreeForAll] = useState(false); // New: enemies fight each other

    const mapSizes = [
        { id: 'small', name: 'Küçük', planets: 6, emoji: '🌑' },
        { id: 'medium', name: 'Orta', planets: 8, emoji: '🌍' },
        { id: 'large', name: 'Büyük', planets: 12, emoji: '🪐' },
        { id: 'xlarge', name: 'Çok Büyük', planets: 18, emoji: '🌌' },
    ];

    const difficulties = [
        { id: 'easy', name: 'Kolay', aiSpeed: 7000, emoji: '😊' },
        { id: 'medium', name: 'Orta', aiSpeed: 4500, emoji: '😐' },
        { id: 'hard', name: 'Zor', aiSpeed: 2500, emoji: '😈' },
    ];

    const handleStartGame = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Generate custom level config
        const mapConfig = mapSizes.find(m => m.id === mapSize);
        const diffConfig = difficulties.find(d => d.id === difficulty);

        const customLevel = generateCustomLevel({
            enemyCount,
            neutralCount,
            mapSize: mapConfig,
            difficulty: diffConfig,
            freeForAll: enemyCount >= 2 ? freeForAll : false,
        });

        navigation.navigate('Game', {
            customLevel,
            isCustomGame: true,
            freeForAll: enemyCount >= 2 ? freeForAll : false,
        });
    };

    const OptionButton = ({ selected, onPress, children, style }) => (
        <TouchableOpacity
            style={[
                styles.optionBtn,
                selected && styles.optionBtnSelected,
                style,
            ]}
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
        >
            <Text style={[
                styles.optionText,
                selected && styles.optionTextSelected,
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    );

    return (
        <GalaxyBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Özel Oyun</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Enemy Count */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👾 Düşman Sayısı</Text>
                        <View style={styles.optionsRow}>
                            {[1, 2, 3, 4].map(count => (
                                <OptionButton
                                    key={count}
                                    selected={enemyCount === count}
                                    onPress={() => setEnemyCount(count)}
                                >
                                    {count}
                                </OptionButton>
                            ))}
                        </View>
                        <Text style={styles.hint}>
                            {enemyCount === 1 ? '1v1 klasik mod' :
                                enemyCount === 2 ? 'İki düşmana karşı' :
                                    enemyCount <= 4 ? `${enemyCount} düşmana karşı` :
                                        '🔥 Kaotik galaksi savaşı!'}
                        </Text>
                    </View>

                    {/* Free-For-All Mode - only show if 2+ enemies */}
                    {enemyCount >= 2 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⚔️ Savaş Modu</Text>
                            <View style={styles.optionsRow}>
                                <OptionButton
                                    selected={!freeForAll}
                                    onPress={() => setFreeForAll(false)}
                                    style={styles.wideOption}
                                >
                                    🤝 Takım
                                </OptionButton>
                                <OptionButton
                                    selected={freeForAll}
                                    onPress={() => setFreeForAll(true)}
                                    style={styles.wideOption}
                                >
                                    🔥 Serbest
                                </OptionButton>
                            </View>
                            <Text style={styles.hint}>
                                {freeForAll
                                    ? 'Düşmanlar birbirine de saldırır! En son ayakta kalan kazanır.'
                                    : 'Tüm düşmanlar sadece sana saldırır.'}
                            </Text>
                        </View>
                    )}

                    {/* Map Size */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🗺️ Harita Boyutu</Text>
                        <View style={styles.optionsRow}>
                            {mapSizes.map(size => (
                                <OptionButton
                                    key={size.id}
                                    selected={mapSize === size.id}
                                    onPress={() => setMapSize(size.id)}
                                    style={styles.wideOption}
                                >
                                    {size.emoji} {size.name}
                                </OptionButton>
                            ))}
                        </View>
                    </View>

                    {/* Neutral Planets */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚪ Nötr Gezegen Sayısı</Text>
                        <View style={styles.optionsRow}>
                            {[2, 4, 6, 8].map(count => (
                                <OptionButton
                                    key={count}
                                    selected={neutralCount === count}
                                    onPress={() => setNeutralCount(count)}
                                >
                                    {count}
                                </OptionButton>
                            ))}
                        </View>
                    </View>

                    {/* Difficulty */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚙️ Zorluk</Text>
                        <View style={styles.optionsRow}>
                            {difficulties.map(diff => (
                                <OptionButton
                                    key={diff.id}
                                    selected={difficulty === diff.id}
                                    onPress={() => setDifficulty(diff.id)}
                                    style={styles.wideOption}
                                >
                                    {diff.emoji} {diff.name}
                                </OptionButton>
                            ))}
                        </View>
                    </View>

                    {/* Summary */}
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>📊 Özet</Text>
                        <Text style={styles.summaryText}>
                            Sen vs {enemyCount} düşman • {mapSizes.find(m => m.id === mapSize)?.name} harita • {neutralCount} nötr gezegen
                        </Text>
                    </View>

                    {/* Start Button */}
                    <TouchableOpacity style={styles.startBtn} onPress={handleStartGame}>
                        <Text style={styles.startBtnText}>🚀 Savaşı Başlat!</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </GalaxyBackground>
    );
};

// Generate a random custom level based on settings
const generateCustomLevel = ({ enemyCount, neutralCount, mapSize, difficulty, freeForAll }) => {
    const planets = [];
    const width = 360;
    // EXPANDED maps for more breathing room
    const height = mapSize.id === 'xlarge' ? 800 : (mapSize.id === 'large' ? 720 : 650);
    const padding = 35;
    const bottomPadding = 160; // Space for PowerUp UI

    // Intelligent neutral planet limiting based on map size
    const maxNeutrals = mapSize.id === 'xlarge' ? 15 : (mapSize.id === 'large' ? 12 : 10);
    // Triple neutrals in FFA mode for more strategic gameplay
    const baseNeutralCount = Math.min(neutralCount, maxNeutrals);
    const adjustedNeutralCount = freeForAll ? Math.min(baseNeutralCount * 3, 20) : baseNeutralCount;

    // SMALLER planets and ships for cleaner battlefield
    // Always scale down significantly for a spacious feel
    const scaleFactor = 0.55; // Smaller planets

    // Enemy identifiers for Free-For-All mode
    const enemyOwners = freeForAll
        ? ['enemy1', 'enemy2', 'enemy3', 'enemy4']
        : Array(4).fill('enemy');

    // Grid-based position generation to avoid overlaps
    const usedPositions = [];

    const getRandomPosition = () => {
        let attempts = 0;
        // INCREASED minimum distance for more spacing
        const minDistance = 110;

        while (attempts < 60) {
            const x = padding + Math.random() * (width - padding * 2);
            // Use full map height
            const maxY = height - bottomPadding;
            const minY = padding + (80 * scaleFactor);

            const y = minY + Math.random() * (maxY - minY);

            // Check for overlap
            const tooClose = usedPositions.some(pos =>
                Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)) < minDistance
            );

            if (!tooClose) {
                usedPositions.push({ x, y });
                return { x, y };
            }
            attempts++;
        }
        // Fallback
        return {
            x: padding + Math.random() * (width - padding * 2),
            y: padding + 100 + Math.random() * (height - bottomPadding - 150)
        };
    };

    // Player planet - positioned in lower-middle area, ABOVE the UI buttons
    // y should be around 400-450 to stay clear of bottom UI (which starts ~500px)
    const playerPos = {
        x: 60 + Math.random() * (width - 120),
        y: Math.min(420, height - bottomPadding - 80) // Stay 80px above UI area
    };
    usedPositions.push(playerPos);
    planets.push({
        id: 'player',
        x: playerPos.x,
        y: playerPos.y,
        troops: difficulty.id === 'easy' ? 40 : difficulty.id === 'medium' ? 35 : 30,
        owner: 'player',
        size: 40 * scaleFactor, // Smaller planet
    });

    // Enemy planets - scattered randomly in FFA for closer combat, top row otherwise
    for (let i = 0; i < enemyCount; i++) {
        let enemyX, enemyY;

        if (freeForAll) {
            // FFA: Scatter enemies randomly across the map for closer battles
            const pos = getRandomPosition();
            enemyX = pos.x;
            enemyY = pos.y;
        } else {
            // Classic: Line up enemies at the top
            enemyX = 60 + (i * (width - 120) / Math.max(1, enemyCount - 1));
            enemyY = (100 * scaleFactor) + Math.random() * 80;
        }

        usedPositions.push({ x: enemyX, y: enemyY });

        const enemyTroops = difficulty.id === 'easy' ? 15 + i * 5 :
            difficulty.id === 'medium' ? 25 + i * 5 :
                35 + i * 8;

        planets.push({
            id: `enemy${i + 1}`,
            x: enemyX,
            y: enemyY,
            troops: enemyTroops,
            owner: enemyOwners[i], // Unique owner in FFA mode
            size: (50 + i * 3) * scaleFactor,
            enemyIndex: i,
        });
    }

    // Neutral planets (spread across middle)
    for (let i = 0; i < adjustedNeutralCount; i++) {
        const pos = getRandomPosition();
        planets.push({
            id: `neutral${i + 1}`,
            x: pos.x,
            y: pos.y,
            troops: 3 + Math.floor(Math.random() * 8),
            owner: 'neutral',
            size: (35 + Math.floor(Math.random() * 15)) * scaleFactor,
        });
    }

    // Adjust AI speed based on complexity (more enemies = slower AI for balanced gameplay)
    const baseAISpeed = difficulty.aiSpeed;
    // In FFA, make AI faster (more aggressive) since they fight each other
    const complexityFactor = freeForAll ? 0.8 : (1 + (enemyCount / 10));
    const adjustedAISpeed = Math.floor(baseAISpeed * complexityFactor);

    // Power-up inventory based on enemy count and difficulty
    const baseInventory = difficulty.id === 'easy' ? 3 : difficulty.id === 'medium' ? 2 : 1;
    const powerUpInventory = {
        shield: baseInventory + enemyCount,
        speed: baseInventory + Math.floor(enemyCount / 2),
        double: baseInventory,
        regen: baseInventory + enemyCount,
    };

    return {
        id: 'custom',
        name: freeForAll ? `FFA: ${enemyCount + 1} Oyuncu` : `Özel: ${enemyCount}v1`,
        difficulty: difficulty.id,
        planets,
        aiSpeed: adjustedAISpeed,
        enemyType: ENEMY_TYPES.STANDARD,
        powerUpInventory,
        isCustom: true,
        freeForAll: freeForAll || false,
        enemyOwners: freeForAll ? enemyOwners.slice(0, enemyCount) : ['enemy'],
    };
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
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    placeholder: {
        width: 44,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.white,
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    optionBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionBtnSelected: {
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        borderColor: theme.colors.primary,
    },
    wideOption: {
        flex: 1,
        minWidth: 80,
    },
    optionText: {
        color: theme.colors.textDim,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: theme.colors.primary,
    },
    hint: {
        color: theme.colors.textDim,
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    summary: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    summaryTitle: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summaryText: {
        color: theme.colors.textDim,
        fontSize: 14,
        textAlign: 'center',
    },
    startBtn: {
        backgroundColor: theme.colors.success,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    startBtnText: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default CustomGameScreen;
