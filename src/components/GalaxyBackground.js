// Enhanced Galaxy Background with animated stars and nebula
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

// Generate static star positions
const generateStars = (count) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 2000 + 1000,
    }));
};

const STARS = generateStars(80);
const NEBULA_COLORS = [
    'rgba(138, 43, 226, 0.1)', // Purple
    'rgba(0, 191, 255, 0.08)', // Cyan
    'rgba(255, 20, 147, 0.06)', // Pink
];

const AnimatedStar = ({ star }) => {
    const opacity = useRef(new Animated.Value(star.opacity)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: star.opacity * 0.3,
                    duration: star.twinkleSpeed,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: star.opacity,
                    duration: star.twinkleSpeed,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    left: star.x,
                    top: star.y,
                    width: star.size,
                    height: star.size,
                    opacity: opacity,
                },
            ]}
        />
    );
};

// Pre-generate bright star positions (static, won't change on re-render)
const BRIGHT_STARS = Array.from({ length: 10 }).map((_, i) => ({
    id: `bright-${i}`,
    x: (Math.sin(i * 1234.5) * 0.5 + 0.5) * width, // Deterministic "random" based on index
    y: (Math.cos(i * 5678.9) * 0.5 + 0.5) * height,
}));

const GalaxyBackground = ({ children, themeColors }) => {
    const nebulaColors = themeColors ? [
        themeColors.primary + '40', // Add transparency
        themeColors.secondary + '30',
        themeColors.purple + '20',
    ] : NEBULA_COLORS;

    return (
        <View style={[styles.container, themeColors && { backgroundColor: themeColors.background }]}>
            {/* Gradient background layers */}
            <View style={styles.gradientLayer1} />
            <View style={styles.gradientLayer2} />

            {/* Nebula effects */}
            {NEBULA_COLORS.map((color, index) => (
                <View
                    key={`nebula-${index}`}
                    style={[
                        styles.nebula,
                        {
                            backgroundColor: nebulaColors[index % nebulaColors.length],

                            left: (index * width * 0.3) - 50,
                            top: (index * height * 0.2) + 100,
                            width: 300 + index * 50,
                            height: 300 + index * 50,
                            transform: [{ rotate: `${index * 45}deg` }],
                        },
                    ]}
                />
            ))}

            {/* Animated stars */}
            {STARS.map(star => (
                <AnimatedStar key={star.id} star={star} />
            ))}

            {/* Static bright stars - using pre-generated positions */}
            {BRIGHT_STARS.map(star => (
                <View
                    key={star.id}
                    style={[
                        styles.brightStar,
                        {
                            left: star.x,
                            top: star.y,
                        },
                    ]}
                />
            ))}

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510',
    },
    gradientLayer1: {
        position: 'absolute',
        width: width * 2,
        height: height * 2,
        top: -height * 0.5,
        left: -width * 0.5,
        backgroundColor: 'transparent',
        borderRadius: width,
        opacity: 0.3,
        shadowColor: '#1a0a2e',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 200,
        elevation: 0,
    },
    gradientLayer2: {
        position: 'absolute',
        width: width,
        height: height,
        backgroundColor: 'transparent',
        opacity: 0.2,
    },
    nebula: {
        position: 'absolute',
        borderRadius: 200,
        opacity: 0.8,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    brightStar: {
        position: 'absolute',
        width: 4,
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});

export default GalaxyBackground;
