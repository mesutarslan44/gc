// Enhanced Ship component with different ship types and trail effects
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import theme from '../constants/theme';

// Ship types with different designs
const SHIP_DESIGNS = {
    player: {
        color: theme.colors.player,
        emoji: '🚀',
        trailColor: 'rgba(0, 255, 136, 0.3)',
    },
    enemy: {
        color: theme.colors.enemy,
        emoji: '👾',
        trailColor: 'rgba(255, 68, 68, 0.3)',
    },
    scout: {
        color: '#00ffff',
        emoji: '🛸',
        trailColor: 'rgba(0, 255, 255, 0.3)',
    },
    tank: {
        color: '#ff8800',
        emoji: '🛡️',
        trailColor: 'rgba(255, 136, 0, 0.3)',
    },
    bomber: {
        color: '#ff4444',
        emoji: '💣',
        trailColor: 'rgba(255, 68, 68, 0.3)',
    },
};

const Ship = ({ fromX, fromY, toX, toY, troops, owner, shipType, duration, onArrival, speedMultiplier = 1, activeShipEmoji, themeColors, scale = 1.0 }) => {
    const positionAnim = useRef(new Animated.ValueXY({ x: fromX, y: fromY })).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Track animation state for dynamic speed changes
    const startTimeRef = useRef(Date.now());
    const initialDurationRef = useRef(duration);
    const lastSpeedRef = useRef(speedMultiplier);
    const progressRef = useRef(0); // 0 to 1

    // Calculate rotation angle
    const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI) + 90;

    // Get ship design - use activeShipEmoji for player ships if provided
    const baseDesign = SHIP_DESIGNS[shipType] || SHIP_DESIGNS[owner] || SHIP_DESIGNS.player;

    // Override color if provided in themeColors
    const displayColor = (themeColors && themeColors[owner]) ? themeColors[owner] : baseDesign.color;
    const displayTrailColor = (themeColors && themeColors[owner])
        ? (themeColors[owner].startsWith('#') ? themeColors[owner] + '4D' : themeColors[owner]) // Add opacity if hex
        : baseDesign.trailColor;

    const design = {
        ...baseDesign,
        color: displayColor,
        trailColor: displayTrailColor,
    };

    const displayEmoji = (owner === 'player' && activeShipEmoji) ? activeShipEmoji : design.emoji;

    useEffect(() => {
        // Entry animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Movement animation - responds to speedMultiplier changes
    useEffect(() => {
        // Calculate current progress based on elapsed time
        const elapsed = Date.now() - startTimeRef.current;
        const previousTotalDuration = initialDurationRef.current / lastSpeedRef.current;
        const currentProgress = Math.min(elapsed / previousTotalDuration, 0.99);

        // Calculate current position based on progress
        const currentX = fromX + (toX - fromX) * currentProgress;
        const currentY = fromY + (toY - fromY) * currentProgress;

        // Set animation to start from current position
        positionAnim.setValue({ x: currentX, y: currentY });

        // Calculate remaining distance and new duration
        const remainingProgress = 1 - currentProgress;
        const newTotalDuration = duration / speedMultiplier;
        const remainingDuration = newTotalDuration * remainingProgress;

        // Update refs
        startTimeRef.current = Date.now();
        initialDurationRef.current = duration * remainingProgress; // Remaining distance as new base
        lastSpeedRef.current = speedMultiplier;
        progressRef.current = currentProgress;

        // Start animation from current position to destination
        Animated.timing(positionAnim, {
            toValue: { x: toX, y: toY },
            duration: Math.max(remainingDuration, 100),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                onArrival();
            }
        });
    }, [speedMultiplier]);

    // Apply scale to sizes
    const shipBodySize = 30 * scale;
    const emojiSize = 24 * scale;
    const badgeSize = 18 * scale;
    const badgeFontSize = 10 * scale;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: positionAnim.x },
                        { translateY: positionAnim.y },
                        { rotate: `${angle}deg` },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            {/* Engine trail effect */}
            <View style={[styles.trail, { backgroundColor: design.trailColor, width: 4 * scale, height: 20 * scale }]} />
            <View style={[styles.trail2, { backgroundColor: design.trailColor, width: 8 * scale, height: 12 * scale }]} />

            {/* Ship body */}
            <Animated.View style={[{ width: shipBodySize, height: shipBodySize, justifyContent: 'center', alignItems: 'center' }, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={{ fontSize: emojiSize }}>{displayEmoji}</Text>
            </Animated.View>

            {/* Troop count */}
            <View style={[styles.troopBadge, { backgroundColor: design.color, minWidth: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
                <Text style={[styles.troops, { fontSize: badgeFontSize }]}>{troops}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        pointerEvents: 'none', // Ships don't block planet touches
    },
    trail: {
        position: 'absolute',
        width: 4,
        height: 20,
        bottom: -20,
        borderRadius: 2,
    },
    trail2: {
        position: 'absolute',
        width: 8,
        height: 12,
        bottom: -12,
        borderRadius: 4,
        opacity: 0.5,
    },
    shipBody: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shipEmoji: {
        fontSize: 24,
    },
    troopBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    troops: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default Ship;
