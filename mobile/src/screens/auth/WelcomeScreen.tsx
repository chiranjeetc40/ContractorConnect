/**
 * Welcome Screen
 * Landing page with options to Register or Login
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { theme } from '../../theme/theme';

type Props = AuthStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      
      <View style={styles.content}>
        {/* Logo/Icon Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🏗️</Text>
          </View>
        </View>
        
        {/* App Name */}
        <Text style={styles.appName}>ContractorConnect</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>
          Find & Hire Local Contractors{'\n'}
          Building Communities Together
        </Text>
        
        {/* Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationPlaceholder}>
            [Construction Illustration]
          </Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Get Started
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.loginButtonLabel}
        >
          I Already Have an Account
        </Button>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  illustrationPlaceholder: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.hint,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
  },
  actionsContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  registerButton: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.primary.main,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.hint,
    marginTop: theme.spacing.sm,
  },
});

export default WelcomeScreen;
