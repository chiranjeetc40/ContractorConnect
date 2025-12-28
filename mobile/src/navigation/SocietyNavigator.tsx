/**
 * Society Navigator
 * Bottom tab navigation for Society users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { SocietyTabParamList } from '../types/navigation.types';

// Import screens
import SocietyHomeScreen from '../screens/society/SocietyHomeScreen';
// import ProfileScreen from '../screens/shared/ProfileScreen'; // TODO: Create this

// Temporary placeholder for Profile
import WelcomeScreen from '../screens/auth/WelcomeScreen';

const Tab = createBottomTabNavigator<SocietyTabParamList>();

const SocietyNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'SocietyHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SocietyProfile') {
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
        name="SocietyHome"
        component={SocietyHomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'My Requests',
        }}
      />
      <Tab.Screen
        name="SocietyProfile"
        component={WelcomeScreen as any}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default SocietyNavigator;
