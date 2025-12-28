/**
 * BidCard Component
 * Display contractor bid summary in lists
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import { theme } from '../../theme/theme';
import StatusChip from './StatusChip';
import { BidStatus } from '../../types/models.types';

interface BidCardProps {
  id: string;
  contractorName: string;
  contractorAvatar?: string;
  bidAmount: number;
  proposalExcerpt: string;
  status: BidStatus;
  dateSubmitted: Date;
  rating?: number; // Future: Contractor rating
  onPress: () => void;
  onAccept?: () => void; // For society only
  onWithdraw?: () => void; // For contractor only, pending bids
  showActions?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({
  id,
  contractorName,
  contractorAvatar,
  bidAmount,
  proposalExcerpt,
  status,
  dateSubmitted,
  rating,
  onPress,
  onAccept,
  onWithdraw,
  showActions = false,
}) => {
  // Format date submitted
  const formatDate = () => {
    const now = new Date();
    const diffMs = now.getTime() - dateSubmitted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return dateSubmitted.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header: Contractor Info and Status */}
      <View style={styles.header}>
        {/* Avatar and Name */}
        <View style={styles.contractorInfo}>
          {contractorAvatar ? (
            <Avatar.Image
              source={{ uri: contractorAvatar }}
              size={48}
            />
          ) : (
            <Avatar.Text
              label={getInitials(contractorName)}
              size={48}
              style={styles.avatarFallback}
            />
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.contractorName}>{contractorName}</Text>
            {rating !== undefined && (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons
                  name="star"
                  size={14}
                  color={theme.colors.warning as any}
                />
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Chip */}
        <StatusChip status={status} variant="bid" size="small" />
      </View>

      {/* Bid Amount */}
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Bid Amount:</Text>
        <Text style={styles.amount}>
          ₹{bidAmount.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Proposal Excerpt */}
      <Text style={styles.proposal} numberOfLines={2}>
        {proposalExcerpt}
      </Text>

      {/* Footer: Date and Actions */}
      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actions}>
            {onAccept && status === BidStatus.PENDING && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={onAccept}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={theme.colors.background.default}
                />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            )}

            {onWithdraw && status === BidStatus.PENDING && (
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={onWithdraw}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={16}
                  color={theme.colors.error as any}
                />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  contractorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarFallback: {
    backgroundColor: theme.colors.primary.main,
  },
  nameContainer: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  contractorName: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  amountLabel: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  amount: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '700',
    color: theme.colors.success as any,
  },
  proposal: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey[200],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    backgroundColor: theme.colors.success as any,
    borderRadius: theme.borderRadius.sm,
  },
  acceptText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.background.default,
    fontWeight: '600',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error as any,
    borderRadius: theme.borderRadius.sm,
  },
  withdrawText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error as any,
    fontWeight: '600',
  },
});

export default BidCard;
