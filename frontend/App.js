import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';

import { Platform, View } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, width: '100%', alignSelf: 'stretch' }}>
      <View style={{ flex: 1, width: '100%', ...Platform.select({ web: { minWidth: '100vw' } }) }}>
        <AuthProvider>
          <FavoritesProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </FavoritesProvider>
        </AuthProvider>
      </View>
    </GestureHandlerRootView>
  );
}
