/**
 * Contractor Stack Navigator
 * Stack navigation for contractor screens (nested in tabs)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import { ContractorStackParamList } from '../types/navigation.types';

// Import screens
import BrowseRequestsScreen from '../screens/contractor/BrowseRequestsScreen';
import SubmitBidScreen from '../screens/contractor/SubmitBidScreen';
// import RequestDetailsScreen from '../screens/contractor/RequestDetailsScreen'; // TODO: Contractor view
// import MyBidsScreen from '../screens/contractor/MyBidsScreen'; // TODO
// import BidDetailsScreen from '../screens/contractor/BidDetailsScreen'; // TODO

const Stack = createNativeStackNavigator<ContractorStackParamList>();

const ContractorStackNavigator: React.FC = () => {
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
        name="BrowseRequests"
        component={BrowseRequestsScreen}
        options={{
          title: 'Available Work',
        }}
      />
      <Stack.Screen
        name="SubmitBid"
        component={SubmitBidScreen}
        options={{
          title: 'Submit Bid',
          headerBackTitle: 'Back',
        }}
      />
      {/* TODO: Add more screens */}
    </Stack.Navigator>
  );
};

export default ContractorStackNavigator;
