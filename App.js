import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomGameScreen from './src/screens/CustomGameScreen';
import ShopScreen from './src/screens/ShopScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="CustomGame" component={CustomGameScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
