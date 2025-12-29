/**
 * OTP Verification Screen
 * 6-digit OTP verification with resend functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { theme } from '../../theme/theme';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api';
import OTPInput from '../../components/auth/OTPInput';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type Props = AuthStackScreenProps<'OTPVerification'>;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  
  // Auth store
  const { setAuth } = useAuthStore();
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Resend timer
  const [resendTimer, setResendTimer] = useState(APP_CONFIG.OTP_RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === APP_CONFIG.OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.length !== APP_CONFIG.OTP_LENGTH) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call verify OTP API
      const response = await authAPI.verifyOTP({
        phone_number: phoneNumber,
        otp,
      });

      // Save auth data
      await setAuth(response.user, response.access_token);
      
      // The RootNavigator will automatically redirect based on auth state and role
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Invalid OTP. Please try again.';
      
      setError(errorMessage);
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      setError('');
      
      // Call resend OTP API
      await authAPI.resendOTP({ phone_number: phoneNumber });

      // Reset timer
      setResendTimer(APP_CONFIG.OTP_RESEND_TIME);
      setCanResend(false);
      
      // Show success message (you can use a toast/snackbar)
      console.log('OTP resent successfully');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>
          </Text>
          
          {/* Change Number Link */}
          <TouchableOpacity
            style={styles.changeNumberButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.changeNumberText}>Change Number</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OTPInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (error) setError('');
            }}
            error={error}
            autoFocus
          />
        </View>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={loading}
            >
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend in {formatTimer(resendTimer)}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <Button
          onPress={handleVerify}
          loading={loading}
          disabled={loading || otp.length !== APP_CONFIG.OTP_LENGTH}
          style={styles.verifyButton}
        >
          Verify
        </Button>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          The OTP will expire in 10 minutes
        </Text>
      </View>

      {/* Full Screen Loading */}
      <Loading visible={loading} fullScreen message="Verifying OTP..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flex: 1,
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
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  changeNumberButton: {
    marginTop: theme.spacing.sm,
  },
  changeNumberText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: theme.spacing.xl,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  resendText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  resendLink: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  timerText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.hint,
    fontWeight: '600',
  },
  verifyButton: {
    marginBottom: theme.spacing.md,
  },
  helperText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.hint,
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
