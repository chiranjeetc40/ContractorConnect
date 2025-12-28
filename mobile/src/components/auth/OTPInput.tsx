/**
 * OTP Input Component
 * 6-digit OTP input with auto-focus
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme/theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  autoFocus = true,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    // Update local state when value prop changes
    const digits = value.split('').slice(0, length);
    const paddedDigits = [...digits, ...Array(length - digits.length).fill('')];
    setOtpValues(paddedDigits);
  }, [value, length]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.slice(-1);
    
    if (digit && !/^\d$/.test(digit)) {
      return; // Only allow digits
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = digit;
    setOtpValues(newOtpValues);

    // Call onChange with complete OTP
    onChange(newOtpValues.join(''));

    // Auto-focus next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        onChange(newOtpValues.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select text on focus for easy replacement
    inputRefs.current[index]?.setSelection(0, 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {otpValues.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              digit && styles.inputFilled,
              error && styles.inputError,
            ]}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            textContentType="oneTimeCode"
          />
        ))}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: theme.colors.border.main,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  inputFilled: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main + '10',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default OTPInput;
