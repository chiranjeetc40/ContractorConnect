/**
 * Input Component
 * Reusable text input with validation and error display
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInputProps } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { theme } from '../../theme/theme';

interface InputProps extends Omit<TextInputProps, 'theme'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  helperText?: string;
  containerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  error,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  helperText,
  containerStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={required ? `${label} *` : label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        mode="outlined"
        error={!!error}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={
          rightIcon ? (
            <TextInput.Icon
              icon={rightIcon}
              onPress={onRightIconPress}
            />
          ) : undefined
        }
        style={styles.input}
        outlineStyle={[
          styles.outline,
          isFocused && styles.outlineFocused,
          error && styles.outlineError,
        ]}
        theme={{
          colors: {
            primary: theme.colors.primary.main,
            error: theme.colors.error,
          },
        }}
        {...textInputProps}
      />
      
      {/* Error or Helper Text */}
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={true}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
  },
  outline: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  outlineFocused: {
    borderWidth: 2,
  },
  outlineError: {
    borderColor: theme.colors.error,
  },
});

export default Input;
