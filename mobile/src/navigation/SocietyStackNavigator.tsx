/**
 * Society Stack Navigator
 * Stack navigation for society screens (nested in tabs)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import { SocietyStackParamList } from '../types/navigation.types';

// Import screens
import SocietyHomeScreen from '../screens/society/SocietyHomeScreen';
import CreateRequestScreen from '../screens/society/CreateRequestScreen';
// import RequestDetailsScreen from '../screens/society/RequestDetailsScreen'; // TODO
// import BidListScreen from '../screens/society/BidListScreen'; // TODO
// import BidDetailsScreen from '../screens/society/BidDetailsScreen'; // TODO

const Stack = createNativeStackNavigator<SocietyStackParamList>();

const SocietyStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary.main,
        },
        headerTintColor: theme.colors.background.default,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="SocietyHomeScreen"
        component={SocietyHomeScreen}
        options={{
          headerShown: false, // Home screen has its own header via tab navigator
        }}
      />
      <Stack.Screen
        name="CreateRequest"
        component={CreateRequestScreen}
        options={{
          title: 'New Request',
          headerBackTitle: 'Back',
        }}
      />
      {/* TODO: Add more screens */}
    </Stack.Navigator>
  );
};

export default SocietyStackNavigator;
