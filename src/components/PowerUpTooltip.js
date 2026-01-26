// Power-up Tooltip - Shows what each power-up does when collected
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import theme from '../constants/theme';

const { width } = Dimensions.get('window');

const PowerUpTooltip = ({ powerUp, onComplete }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after 2.5 seconds
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (onComplete) onComplete();
            });
        }, 2500);

        return () => clearTimeout(timeout);
    }, []);

    if (!powerUp) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={[styles.card, { borderColor: powerUp.color }]}>
                <Text style={styles.emoji}>{powerUp.emoji}</Text>
                <View style={styles.textContainer}>
                    <Text style={[styles.name, { color: powerUp.color }]}>
                        {powerUp.name} Aktif!
                    </Text>
                    <Text style={styles.description}>{powerUp.description}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        zIndex: 200,
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 10, 30, 0.95)',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 2,
        gap: 14,
        maxWidth: width - 40,
    },
    emoji: {
        fontSize: 32,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginTop: 2,
    },
});

export default PowerUpTooltip;
