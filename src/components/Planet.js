import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import theme from '../constants/theme';

const PLANET_COLORS = {
    player: { bg: '#00ff88', border: '#00aa55' },
    enemy: { bg: '#ff4444', border: '#aa2222' },
    neutral: { bg: '#888888', border: '#555555' },
};

const Planet = ({
    x,
    y,
    troops,
    owner,
    size = 50,
    isSelected = false,
    isHoverTarget = false,
    hasShield = false,
    isBoss = false,
    onPress,
    onLongPress,
    themeColors,
}) => {
    // Generate colors from theme if provided, otherwise use defaults
    const getColors = () => {
        if (themeColors && themeColors[owner]) {
            return {
                bg: themeColors[owner],
                border: themeColors[owner], // Could be darkened if needed
            };
        }
        return PLANET_COLORS[owner] || PLANET_COLORS.neutral;
    };

    const colors = getColors();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shieldAnim = useRef(new Animated.Value(1)).current;

    // Boss & Shield animations
    useEffect(() => {
        if (isBoss) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
        if (hasShield) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shieldAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(shieldAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [isBoss, hasShield]);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                },
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.8}
            // Increase touch target for better cross-device compatibility
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
            {/* Boss aura effect */}
            {isBoss && (
                <>
                    <View style={[
                        styles.bossAura,
                        {
                            backgroundColor: 'rgba(168, 85, 247, 0.3)',
                            width: size * 1.8,
                            height: size * 1.8,
                            borderRadius: size,
                        }
                    ]} />
                    <View style={[
                        styles.bossAura,
                        {
                            backgroundColor: owner === 'player' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                            width: size * 1.5,
                            height: size * 1.5,
                            borderRadius: size,
                        }
                    ]} />
                </>
            )}

            {/* Shield effect */}
            {hasShield && (
                <Animated.View style={[
                    styles.shield,
                    {
                        width: size * 1.3,
                        height: size * 1.3,
                        borderRadius: size,
                        transform: [{ scale: shieldAnim }]
                    }
                ]} />
            )}

            {/* Glow effect when selected */}
            {isSelected && (
                <View style={[
                    styles.glow,
                    {
                        backgroundColor: colors.bg,
                        width: size * 1.4,
                        height: size * 1.4,
                        borderRadius: size,
                    }
                ]} />
            )}

            {/* Target glow effect when hovering during drag */}
            {isHoverTarget && !isSelected && (
                <View style={[
                    styles.targetGlow,
                    {
                        width: size * 1.6,
                        height: size * 1.6,
                        borderRadius: size,
                    }
                ]} />
            )}

            {/* Planet body */}
            <Animated.View style={[
                styles.planet,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    // If boss is conquered by player, show player color (green). If enemy/neutral boss, show purple.
                    backgroundColor: (isBoss && owner !== 'player') ? 'rgba(168, 85, 247, 0.8)' : colors.bg,
                    borderColor: (isBoss && owner !== 'player') ? theme.colors.purple : colors.border,
                    borderWidth: isBoss ? 4 : 3,
                    transform: [{ scale: pulseAnim }],
                }
            ]}>
                {/* Boss crown */}
                {isBoss && (
                    <Text style={styles.bossIcon}>👑</Text>
                )}
                {/* Highlight */}
                <View style={[
                    styles.highlight,
                    { width: size * 0.25, height: size * 0.25 }
                ]} />
            </Animated.View>

            {/* Troop count */}
            <View style={[
                styles.troopBadge,
                isBoss && styles.bossTroopBadge,
            ]}>
                <Text
                    style={[
                        styles.troopText,
                        isBoss && styles.bossTroopText,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.6}
                >
                    {troops}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bossAura: {
        position: 'absolute',
    },
    glow: {
        position: 'absolute',
        opacity: 0.3,
    },
    targetGlow: {
        position: 'absolute',
        backgroundColor: '#00d4ff',
        opacity: 0.5,
        borderWidth: 3,
        borderColor: '#00ffff',
    },
    shield: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 200, 255, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 255, 0.8)',
        shadowColor: '#00ffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    planet: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bossIcon: {
        fontSize: 24,
        position: 'absolute',
        top: -8,
    },
    highlight: {
        position: 'absolute',
        top: 8,
        left: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    troopBadge: {
        position: 'absolute',
        bottom: -12, // Moved slightly lower to not cover planet
        backgroundColor: 'rgba(0,0,0,0.85)', // Slightly more transparent
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        minWidth: 26,
        maxWidth: 80, // Allowed more width but constrained
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bossTroopBadge: {
        backgroundColor: 'rgba(168, 85, 247, 0.85)',
        borderColor: theme.colors.purple,
        borderWidth: 2,
        minWidth: 32,
    },
    troopText: {
        color: theme.colors.white,
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    bossTroopText: {
        fontSize: 13,
    },
});

export default Planet;
