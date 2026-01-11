/**
 * Login Screen
 * User login with phone and password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  // Auth store
  const { setAuth } = useAuthStore();
  
  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');  // Toggle between methods
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Password validation (only for password login)
    if (loginMethod === 'password') {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (loginMethod === 'password') {
        // Password-based login
        const response = await authAPI.loginWithPassword({
          phone_number: phoneNumber.replace(/\s/g, ''),
          password,
        });

        // Save auth data and navigate to main app
        await setAuth(response.user, response.access_token);
        // Navigation will be handled by RootNavigator
      } else {
        // OTP-based login
        const response = await authAPI.requestLoginOTP(phoneNumber.replace(/\s/g, ''));

        // Navigate to OTP verification
        navigation.navigate('OTPVerification', {
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Login failed. Please check your credentials.';
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Login to your ContractorConnect account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Login Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === 'password' && styles.toggleButtonActive
                ]}
                onPress={() => setLoginMethod('password')}
                disabled={loading}
              >
                <Text style={[
                  styles.toggleButtonText,
                  loginMethod === 'password' && styles.toggleButtonTextActive
                ]}>
                  🔑 Password Login
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === 'otp' && styles.toggleButtonActive
                ]}
                onPress={() => setLoginMethod('otp')}
                disabled={loading}
              >
                <Text style={[
                  styles.toggleButtonText,
                  loginMethod === 'otp' && styles.toggleButtonTextActive
                ]}>
                  📱 OTP Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone Number */}
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                setPhoneNumber(cleaned);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: '' });
                }
              }}
              error={errors.phoneNumber}
              required
              leftIcon="phone"
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="9876543210"
              autoComplete="tel"
              autoFocus
            />

            {/* Password (only for password login) */}
            {loginMethod === 'password' && (
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                error={errors.password}
                required
                leftIcon="lock"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
            )}

            {/* OTP Info (only for OTP login) */}
            {loginMethod === 'otp' && (
              <Text style={styles.otpInfoText}>
                📱 An OTP will be sent to your phone number for verification
              </Text>
            )}

            {/* Forgot Password Link (only for password login) */}
            {loginMethod === 'password' && (
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => {
                  // Switch to OTP login
                  setLoginMethod('otp');
                }}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password? Use OTP</Text>
              </TouchableOpacity>
            )}

            {/* General Error */}
            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
            >
              Login
            </Button>

            {/* Register Link */}
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By logging in, you agree to our{'\n'}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Loading */}
      <Loading visible={loading} fullScreen message="Logging you in..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main + '10',
  },
  toggleButtonText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: theme.colors.primary.main,
  },
  otpInfoText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    fontStyle: 'italic',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  forgotPasswordText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  registerLinkText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  registerLink: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
});

export default LoginScreen;
