/**
 * Navigation Type Definitions
 * Type-safe navigation throughout the app
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============ Root Navigation ============

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Society: NavigatorScreenParams<SocietyTabParamList>;
  Contractor: NavigatorScreenParams<ContractorTabParamList>;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// ============ Auth Stack ============

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  OTPVerification: {
    phoneNumber: string;
    userId?: string;
  };
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// ============ Society Tab Navigation ============

export type SocietyTabParamList = {
  SocietyHome: undefined;
  SocietyRequests: undefined;
  SocietyBids: undefined;
  SocietyProfile: undefined;
};

export type SocietyTabScreenProps<T extends keyof SocietyTabParamList> =
  BottomTabScreenProps<SocietyTabParamList, T>;

// ============ Society Stack (nested in tabs) ============

export type SocietyStackParamList = {
  SocietyHomeScreen: undefined;
  CreateRequest: undefined;
  RequestDetails: {
    requestId: string;
  };
  BidList: {
    requestId: string;
  };
  BidDetails: {
    bidId: string;
  };
  ContractorProfile: {
    contractorId: string;
  };
};

export type SocietyStackScreenProps<T extends keyof SocietyStackParamList> =
  NativeStackScreenProps<SocietyStackParamList, T>;

// ============ Contractor Tab Navigation ============

export type ContractorTabParamList = {
  ContractorHome: undefined;
  ContractorBids: undefined;
  ContractorWork: undefined;
  ContractorProfile: undefined;
};

export type ContractorTabScreenProps<T extends keyof ContractorTabParamList> =
  BottomTabScreenProps<ContractorTabParamList, T>;

// ============ Contractor Stack (nested in tabs) ============

export type ContractorStackParamList = {
  BrowseRequests: undefined;
  RequestDetails: {
    requestId: string;
  };
  SubmitBid: {
    requestId: string;
  };
  MyBids: undefined;
  BidDetails: {
    bidId: string;
  };
  MyWork: undefined;
  WorkDetails: {
    requestId: string;
  };
};

export type ContractorStackScreenProps<T extends keyof ContractorStackParamList> =
  NativeStackScreenProps<ContractorStackParamList, T>;

// ============ Shared Screens ============

export type SharedStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

export type SharedStackScreenProps<T extends keyof SharedStackParamList> =
  NativeStackScreenProps<SharedStackParamList, T>;

// ============ Helper Types ============

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
