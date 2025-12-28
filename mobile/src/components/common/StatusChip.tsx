/**
 * StatusChip Component
 * Display status badges for requests and bids
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { RequestStatus, BidStatus } from '../../types/models.types';
import { theme } from '../../theme/theme';

interface StatusChipProps {
  status: RequestStatus | BidStatus;
  variant?: 'request' | 'bid';
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  variant = 'request',
  size = 'medium' 
}) => {
  // Get status color and label
  const getStatusConfig = () => {
    if (variant === 'request') {
      switch (status as RequestStatus) {
        case RequestStatus.OPEN:
          return {
            label: 'Open',
            color: theme.colors.success,
            icon: 'checkbox-blank-circle',
          };
        case RequestStatus.IN_PROGRESS:
          return {
            label: 'In Progress',
            color: theme.colors.primary.main,
            icon: 'clock-outline',
          };
        case RequestStatus.COMPLETED:
          return {
            label: 'Completed',
            color: '#9C27B0', // Purple
            icon: 'check-circle',
          };
        case RequestStatus.CANCELLED:
          return {
            label: 'Cancelled',
            color: theme.colors.error,
            icon: 'close-circle',
          };
        case RequestStatus.ON_HOLD:
          return {
            label: 'On Hold',
            color: theme.colors.warning,
            icon: 'pause-circle',
          };
        default:
          return {
            label: status,
            color: theme.colors.text.secondary,
            icon: 'help-circle',
          };
      }
    } else {
      // Bid status
      switch (status as BidStatus) {
        case BidStatus.PENDING:
          return {
            label: 'Pending',
            color: theme.colors.warning,
            icon: 'clock-outline',
          };
        case BidStatus.ACCEPTED:
          return {
            label: 'Accepted',
            color: theme.colors.success,
            icon: 'check-circle',
          };
        case BidStatus.REJECTED:
          return {
            label: 'Rejected',
            color: theme.colors.error,
            icon: 'close-circle',
          };
        case BidStatus.WITHDRAWN:
          return {
            label: 'Withdrawn',
            color: theme.colors.text.hint,
            icon: 'arrow-u-left-top',
          };
        default:
          return {
            label: status,
            color: theme.colors.text.secondary,
            icon: 'help-circle',
          };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      style={[
        styles.chip,
        { backgroundColor: config.color + '20' },
        size === 'small' && styles.chipSmall,
      ]}
      textStyle={[
        styles.chipText,
        { color: config.color },
        size === 'small' && styles.chipTextSmall,
      ]}
      compact={size === 'small'}
    >
      {config.label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
  chipSmall: {
    height: 24,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSmall: {
    fontSize: 10,
  },
});

export default StatusChip;
