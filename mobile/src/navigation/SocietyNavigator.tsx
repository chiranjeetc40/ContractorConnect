/**
 * Society Navigator
 * Bottom tab navigation for Society users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { SocietyTabParamList } from '../types/navigation.types';

// Import navigators and screens
import SocietyStackNavigator from './SocietyStackNavigator';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator<SocietyTabParamList>();

const SocietyNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
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
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
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
        component={SocietyStackNavigator}
        options={{
          title: 'Home',
          headerShown: false, // Stack navigator will handle headers
        }}
      />
      <Tab.Screen
        name="SocietyProfile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default SocietyNavigator;
