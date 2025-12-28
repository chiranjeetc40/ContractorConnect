/**
 * EmptyState Component
 * Display when lists or screens have no data
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  illustration,
}) => {
  return (
    <View style={styles.container}>
      {/* Illustration or Icon */}
      {illustration ? (
        illustration
      ) : (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          mode="contained"
          style={styles.button}
          fullWidth={false}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.grey[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  button: {
    marginTop: theme.spacing.md,
    minWidth: 150,
  },
});

export default EmptyState;
