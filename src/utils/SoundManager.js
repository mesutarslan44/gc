// Sound Manager for Galaxy Conquest - Real Sound Files
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@galaxy_conquest_settings';

// Sound file mappings
const SOUND_FILES = {
    select: require('../../assets/sounds/select.mp3'),
    attack: require('../../assets/sounds/attack.mp3'),
    capture: require('../../assets/sounds/capture.mp3'),
    powerup: require('../../assets/sounds/powerup.mp3'),
    victory: require('../../assets/sounds/victory.mp3'),
    defeat: require('../../assets/sounds/defeat.mp3'),
};

class SoundManager {
    constructor() {
        this.sounds = {};
        this.soundEnabled = true;
        this.initialized = false;
        this.volume = 0.5;
    }

    async init() {
        if (this.initialized) return;

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: false,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Load settings
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                this.soundEnabled = settings.soundEnabled ?? true;
            }

            // Preload sounds
            await this.preloadSounds();

            this.initialized = true;
            console.log('SoundManager initialized with real sounds');
        } catch (error) {
            console.log('Sound init error:', error);
        }
    }

    async preloadSounds() {
        try {
            for (const [name, file] of Object.entries(SOUND_FILES)) {
                const { sound } = await Audio.Sound.createAsync(file, {
                    volume: this.volume,
                    shouldPlay: false,
                });
                this.sounds[name] = sound;
            }
        } catch (error) {
            console.log('Sound preload error:', error);
        }
    }

    async playSound(soundName) {
        if (!this.soundEnabled) return;

        try {
            const sound = this.sounds[soundName];
            if (sound) {
                await sound.setPositionAsync(0);
                await sound.playAsync();
            }
        } catch (error) {
            // Silent fail for sound playing errors
            console.log('Sound play error:', soundName, error.message);
        }
    }

    async playSelect() {
        await this.playSound('select');
    }

    async playAttack() {
        await this.playSound('attack');
    }

    async playCapture() {
        await this.playSound('capture');
    }

    async playPowerUp() {
        await this.playSound('powerup');
    }

    async playVictory() {
        await this.playSound('victory');
    }

    async playDefeat() {
        await this.playSound('defeat');
    }

    setEnabled(enabled) {
        this.soundEnabled = enabled;
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ soundEnabled: enabled }));
    }

    isEnabled() {
        return this.soundEnabled;
    }

    async setVolume(vol) {
        this.volume = vol;
        for (const sound of Object.values(this.sounds)) {
            try {
                await sound.setVolumeAsync(vol);
            } catch (error) {
                // Ignore volume errors
            }
        }
    }

    async cleanup() {
        for (const sound of Object.values(this.sounds)) {
            try {
                await sound.unloadAsync();
            } catch (error) {
                // Ignore cleanup errors
            }
        }
        this.sounds = {};
    }
}

// Singleton instance
const soundManager = new SoundManager();
export default soundManager;
