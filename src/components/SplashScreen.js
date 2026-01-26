// Splash Screen Component for Galaxy Conquest
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import GalaxyBackground from './GalaxyBackground';
import theme from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const starsOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence
        Animated.sequence([
            // Stars fade in
            Animated.timing(starsOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            // Logo scale up
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            // Title fade in
            Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            // Subtitle fade in
            Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            // Wait a moment
            Animated.delay(800),
        ]).start(() => {
            // Fade out and finish
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(titleOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onFinish?.();
            });
        });
    }, []);

    return (
        <GalaxyBackground>
            <View style={styles.container}>
                {/* Animated Stars */}
                <Animated.View style={[styles.starsContainer, { opacity: starsOpacity }]}>
                    {[...Array(20)].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.star,
                                {
                                    left: Math.random() * width,
                                    top: Math.random() * height,
                                    width: 2 + Math.random() * 3,
                                    height: 2 + Math.random() * 3,
                                },
                            ]}
                        />
                    ))}
                </Animated.View>

                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <Text style={styles.logoEmoji}>🌌</Text>
                    <View style={styles.planetOrbit}>
                        <Text style={styles.planetEmoji}>🪐</Text>
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
                    Galaxy Conquest
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                    Galaksiyi Fethet!
                </Animated.Text>
            </View>
        </GalaxyBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    starsContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 10,
        opacity: 0.8,
    },
    logoContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logoEmoji: {
        fontSize: 80,
    },
    planetOrbit: {
        position: 'absolute',
        right: 0,
        top: 10,
    },
    planetEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.colors.white,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textDim,
        fontStyle: 'italic',
    },
});

export default SplashScreen;
