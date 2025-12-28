/**
 * Root Navigator
 * Main app navigation structure with authentication flow
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types/navigation.types';

// Import navigators
import AuthNavigator from './AuthNavigator';
import SocietyNavigator from './SocietyNavigator';
import ContractorNavigator from './ContractorNavigator';

// Temporary placeholder screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isInitializing, user, initialize } = useAuthStore();
  
  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);
  
  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack - for non-authenticated users
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
          />
        ) : user?.role === 'Society' ? (
          // Society Stack - for society users
          <Stack.Screen 
            name="Society" 
            component={SocietyNavigator}
          />
        ) : (
          // Contractor Stack - for contractor users
          <Stack.Screen 
            name="Contractor" 
            component={ContractorNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default RootNavigator;
