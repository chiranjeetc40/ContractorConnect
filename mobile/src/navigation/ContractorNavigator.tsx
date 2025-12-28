/**
 * Contractor Navigator
 * Bottom tab navigation for Contractor users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { ContractorTabParamList } from '../types/navigation.types';

// Import navigators
import ContractorStackNavigator from './ContractorStackNavigator';
// import ProfileScreen from '../screens/shared/ProfileScreen'; // TODO: Create this

// Temporary placeholder for Profile
import WelcomeScreen from '../screens/auth/WelcomeScreen';

const Tab = createBottomTabNavigator<ContractorTabParamList>();

const ContractorNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'ContractorHome') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'ContractorBids') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'ContractorWork') {
            iconName = focused ? 'hammer-wrench' : 'hammer-wrench';
          } else if (route.name === 'ContractorProfile') {
            iconName = focused ? 'account' : 'account-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.grey[500],
        tabBarStyle: {
          backgroundColor: theme.colors.background.paper,
          borderTopWidth: 1,
          borderTopColor: theme.colors.grey[200],
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary.main,
        },
        headerTintColor: theme.colors.background.default,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="ContractorHome"
        component={ContractorStackNavigator}
        options={{
          title: 'Browse',
          headerShown: false, // Stack navigator will handle headers
        }}
      />
      <Tab.Screen
        name="ContractorBids"
        component={WelcomeScreen as any}
        options={{
          title: 'My Bids',
        }}
      />
      <Tab.Screen
        name="ContractorWork"
        component={WelcomeScreen as any}
        options={{
          title: 'My Work',
        }}
      />
      <Tab.Screen
        name="ContractorProfile"
        component={WelcomeScreen as any}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default ContractorNavigator;
