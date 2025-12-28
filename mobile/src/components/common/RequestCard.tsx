/**
 * RequestCard Component
 * Display work request summary in lists
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import StatusChip from './StatusChip';
import { RequestStatus } from '../../types/models.types';

interface RequestCardProps {
  id: string;
  title: string;
  category: string;
  status: RequestStatus;
  location: string; // City only
  budgetMin?: number;
  budgetMax?: number;
  datePosted: Date;
  bidCount: number;
  onPress: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  id,
  title,
  category,
  status,
  location,
  budgetMin,
  budgetMax,
  datePosted,
  bidCount,
  onPress,
}) => {
  // Format budget range
  const formatBudget = () => {
    if (!budgetMin && !budgetMax) return 'Budget not specified';
    if (budgetMin && budgetMax) {
      return `₹${budgetMin.toLocaleString('en-IN')} - ₹${budgetMax.toLocaleString('en-IN')}`;
    }
    if (budgetMin) return `₹${budgetMin.toLocaleString('en-IN')}+`;
    return `Up to ₹${budgetMax?.toLocaleString('en-IN')}`;
  };

  // Format date posted
  const formatDate = () => {
    const now = new Date();
    const diffMs = now.getTime() - datePosted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return datePosted.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Get category icon
  const getCategoryIcon = () => {
    const iconMap: Record<string, string> = {
      'Plumbing': 'water',
      'Electrical': 'flash',
      'Carpentry': 'hammer',
      'Painting': 'palette',
      'Cleaning': 'sparkles',
      'Gardening': 'flower',
      'Security': 'shield-check',
      'Other': 'tools',
    };
    return iconMap[category] || 'tools';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header: Title and Status */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <StatusChip status={status} variant="request" size="small" />
      </View>

      {/* Category and Location */}
      <View style={styles.row}>
        <View style={styles.iconRow}>
          <MaterialCommunityIcons
            name={getCategoryIcon() as any}
            size={16}
            color={theme.colors.primary.main}
          />
          <Text style={styles.category}>{category}</Text>
        </View>
        <View style={styles.iconRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        <MaterialCommunityIcons
          name="cash"
          size={18}
          color={theme.colors.success as any}
        />
        <Text style={styles.budget}>{formatBudget()}</Text>
      </View>

      {/* Footer: Date and Bid Count */}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate()}</Text>
        <View style={styles.bidBadge}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={14}
            color={theme.colors.primary.main}
          />
          <Text style={styles.bidCount}>
            {bidCount} {bidCount === 1 ? 'Bid' : 'Bids'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '500',
  },
  location: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  budget: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.success as any,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey[200],
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  bidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    backgroundColor: theme.colors.primary.light + '20',
    borderRadius: theme.borderRadius.sm,
  },
  bidCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
});

export default RequestCard;
