/**
 * Button Component
 * Reusable button with different variants
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, ActivityIndicator } from 'react-native-paper';
import { theme } from '../../theme/theme';

interface ButtonProps {
  children: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = true,
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    if (size === 'small') {
      baseStyle.push(styles.small);
    } else if (size === 'large') {
      baseStyle.push(styles.large);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getContentStyle = () => {
    if (size === 'small') {
      return styles.contentSmall;
    } else if (size === 'large') {
      return styles.contentLarge;
    }
    return styles.content;
  };

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      style={getButtonStyle()}
      contentStyle={getContentStyle()}
      labelStyle={[
        styles.label,
        mode === 'outlined' && styles.outlinedLabel,
        mode === 'text' && styles.textLabel,
      ]}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: theme.spacing.sm,
  },
  contentSmall: {
    paddingVertical: theme.spacing.xs,
  },
  contentLarge: {
    paddingVertical: theme.spacing.md,
  },
  small: {
    // Additional small button styles if needed
  },
  large: {
    // Additional large button styles if needed
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  outlinedLabel: {
    color: theme.colors.primary.main,
  },
  textLabel: {
    color: theme.colors.primary.main,
  },
});

export default Button;
