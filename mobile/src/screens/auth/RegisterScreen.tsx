/**
 * Register Screen
 * User registration with role selection
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
import { RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { UserRole } from '../../types/models.types';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type Props = AuthStackScreenProps<'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  // Auth store
  const { setAuth } = useAuthStore();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SOCIETY);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Email validation (optional but validate if provided)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Note: Password is optional for OTP-based authentication
    // Password validation removed - using OTP for authentication

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Call register API
      const response = await authAPI.register({
        name: fullName.trim(),
        phone_number: phoneNumber.replace(/\s/g, ''),
        email: email.trim() || undefined,
        password: password.trim() || undefined,  // Include password if provided
        role,
      });

      // Registration successful - always requires OTP verification
      if (response.requires_verification) {
        // Navigate to OTP screen
        navigation.navigate('OTPVerification', {
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        });
      } else {
        // Fallback - if somehow no verification required
        if (response.access_token && response.user) {
          await setAuth(response.user, response.access_token);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Registration failed. Please try again.';
      
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join ContractorConnect to get started
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) {
                  setErrors({ ...errors, fullName: '' });
                }
              }}
              error={errors.fullName}
              required
              leftIcon="account"
              autoCapitalize="words"
              autoComplete="name"
            />

            {/* Phone Number */}
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                // Only allow digits
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
            />

            {/* Email (Optional) */}
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              error={errors.email}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              helperText="Optional"
            />

            {/* Password - For future login */}
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
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              helperText="Optional - Set password for quick login later"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              error={errors.confirmPassword}
              leftIcon="lock-check"
              rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              helperText="Optional - Must match password above"
            />

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a: *</Text>
              
              <RadioButton.Group
                onValueChange={(value) => setRole(value as UserRole)}
                value={role}
              >
              
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === UserRole.SOCIETY && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRole(UserRole.SOCIETY)}
                  activeOpacity={0.7}
                >
                  <RadioButton.Android value={UserRole.SOCIETY} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>🏢 Building Society</Text>
                    <Text style={styles.roleDescription}>
                      Post work requests and hire contractors
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === UserRole.CONTRACTOR && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRole(UserRole.CONTRACTOR)}
                  activeOpacity={0.7}
                >
                  <RadioButton.Android value={UserRole.CONTRACTOR} />
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>👷 Contractor</Text>
                    <Text style={styles.roleDescription}>
                      Find work and submit bids
                    </Text>
                  </View>
                </TouchableOpacity>
              </RadioButton.Group>
            </View>

            {/* General Error */}
            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            {/* Register Button */}
            <Button
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Loading */}
      <Loading visible={loading} fullScreen message="Creating your account..." />
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
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
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
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  roleContainer: {
    marginBottom: theme.spacing.md,
  },
  roleLabel: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  roleOptionSelected: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main + '10',
  },
  roleContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  roleTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: theme.spacing.lg,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  loginLinkText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  loginLink: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
});

export default RegisterScreen;
