// Confetti Animation for Victory Screen
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = [
    '#FFD700', // Gold
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#A855F7', // Purple
    '#00D4FF', // Cyan
    '#FF69B4', // Pink
    '#32CD32', // Green
];

const ConfettiPiece = ({ delay, startX }) => {
    const fallAnim = useRef(new Animated.Value(-50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size = Math.random() * 8 + 6;
    const shape = Math.random() > 0.5 ? 'square' : 'circle';

    useEffect(() => {
        const duration = 3000 + Math.random() * 2000;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(fallAnim, {
                    toValue: height + 100,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 10,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(swayAnim, {
                            toValue: 30,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(swayAnim, {
                            toValue: -30,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ])
                ),
                Animated.sequence([
                    Animated.delay(duration * 0.7),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: duration * 0.3,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 10],
        outputRange: ['0deg', '3600deg'],
    });

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    left: startX,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: shape === 'circle' ? size / 2 : 2,
                    transform: [
                        { translateY: fallAnim },
                        { translateX: swayAnim },
                        { rotate: spin },
                    ],
                    opacity: opacityAnim,
                },
            ]}
        />
    );
};

const Confetti = ({ count = 50 }) => {
    const pieces = Array.from({ length: count }).map((_, i) => ({
        id: i,
        delay: Math.random() * 1500,
        startX: Math.random() * width,
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {pieces.map(piece => (
                <ConfettiPiece
                    key={piece.id}
                    delay={piece.delay}
                    startX={piece.startX}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    confetti: {
        position: 'absolute',
        top: 0,
    },
});

export default Confetti;
