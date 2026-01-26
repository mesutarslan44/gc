// Explosion particle effect when ships arrive or planets are captured
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Explosion = ({ x, y, color = '#ff6b6b', size = 'medium', onComplete }) => {
    const particles = useRef([...Array(12)].map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(1),
    }))).current;

    const sizeConfig = {
        small: { particleSize: 6, distance: 30, duration: 400 },
        medium: { particleSize: 8, distance: 50, duration: 500 },
        large: { particleSize: 12, distance: 80, duration: 700 },
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    useEffect(() => {
        const animations = particles.map((particle, index) => {
            const angle = (index / particles.length) * Math.PI * 2;
            const distance = config.distance * (0.5 + Math.random() * 0.5);

            return Animated.parallel([
                Animated.timing(particle.x, {
                    toValue: Math.cos(angle) * distance,
                    duration: config.duration,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.y, {
                    toValue: Math.sin(angle) * distance,
                    duration: config.duration,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                    toValue: 0,
                    duration: config.duration,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(particle.scale, {
                        toValue: 1.5,
                        duration: config.duration * 0.3,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.scale, {
                        toValue: 0,
                        duration: config.duration * 0.7,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        });

        Animated.parallel(animations).start(() => {
            if (onComplete) onComplete();
        });
    }, []);

    return (
        <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
            {particles.map((particle, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.particle,
                        {
                            width: config.particleSize,
                            height: config.particleSize,
                            borderRadius: config.particleSize / 2,
                            backgroundColor: color,
                            transform: [
                                { translateX: particle.x },
                                { translateY: particle.y },
                                { scale: particle.scale },
                            ],
                            opacity: particle.opacity,
                        },
                    ]}
                />
            ))}
            {/* Center flash */}
            <Animated.View
                style={[
                    styles.flash,
                    {
                        backgroundColor: color,
                        opacity: particles[0].opacity,
                        transform: [{ scale: particles[0].scale }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 0,
        height: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    particle: {
        position: 'absolute',
    },
    flash: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});

export default Explosion;
