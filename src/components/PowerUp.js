// Power-up component that appears on game screen
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

const PowerUp = ({ x, y, type, onCollect }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start();

        // Rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity
            style={[styles.container, { left: x - 25, top: y - 25 }]}
            onPress={onCollect}
            activeOpacity={0.8}
        >
            <Animated.View
                style={[
                    styles.powerUp,
                    {
                        backgroundColor: type.color + '30',
                        borderColor: type.color,
                        transform: [{ scale: pulseAnim }, { rotate: spin }],
                    },
                ]}
            >
                <Animated.View style={[styles.glow, { opacity: glowAnim, backgroundColor: type.color }]} />
                <Text style={styles.emoji}>{type.emoji}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    powerUp: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    emoji: {
        fontSize: 24,
        zIndex: 1,
    },
});

export default PowerUp;
