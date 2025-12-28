/**
 * Loading Component
 * Various loading indicators for different use cases
 */

import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { theme } from '../../theme/theme';

interface LoadingProps {
  visible?: boolean;
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message,
  fullScreen = false,
  size = 'large',
  color = theme.colors.primary.main,
}) => {
  if (!visible) return null;

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreenContainer]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

// Inline loading indicator for smaller use cases
export const InlineLoading: React.FC<Omit<LoadingProps, 'fullScreen'>> = ({
  visible = true,
  message,
  size = 'small',
  color = theme.colors.primary.main,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  inlineMessage: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
});

export default Loading;
