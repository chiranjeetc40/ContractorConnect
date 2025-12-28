/**
 * Request Details Screen
 * View full request information and received bids
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider, Menu } from 'react-native-paper';
import { theme } from '../../theme/theme';
import { SocietyStackScreenProps } from '../../types/navigation.types';
import { RequestStatus, BidStatus } from '../../types/models.types';
import StatusChip from '../../components/common/StatusChip';
import BidCard from '../../components/common/BidCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';

type Props = SocietyStackScreenProps<'RequestDetails'>;

interface MockBid {
  id: string;
  contractorName: string;
  contractorAvatar?: string;
  bidAmount: number;
  proposalExcerpt: string;
  status: BidStatus;
  dateSubmitted: Date;
  rating?: number;
}

interface MockRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  locationAddress: string;
  locationCity: string;
  locationState: string;
  locationPincode: string;
  budgetMin?: number;
  budgetMax?: number;
  datePosted: Date;
  dateUpdated: Date;
}

const RequestDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'bids'>('details');

  // TODO: Replace with actual API data
  const [request, setRequest] = useState<MockRequest>({
    id: requestId,
    title: 'Fix Leaking Pipe in Bathroom',
    description: 'There is a major leak in the bathroom sink pipe. Water is dripping continuously and needs immediate attention. The pipe appears to be old and may need replacement. Looking for an experienced plumber who can fix this issue today or tomorrow.',
    category: 'Plumbing',
    status: RequestStatus.OPEN,
    locationAddress: 'Building A, Wing 3, Floor 5',
    locationCity: 'Mumbai',
    locationState: 'Maharashtra',
    locationPincode: '400001',
    budgetMin: 2000,
    budgetMax: 5000,
    datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dateUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
  });

  const [bids, setBids] = useState<MockBid[]>([
    {
      id: '1',
      contractorName: 'Rajesh Kumar',
      bidAmount: 3500,
      proposalExcerpt: 'I have 10 years of experience in plumbing. I can fix this issue within 2 hours with quality materials.',
      status: BidStatus.PENDING,
      dateSubmitted: new Date(Date.now() - 1 * 60 * 60 * 1000),
      rating: 4.5,
    },
    {
      id: '2',
      contractorName: 'Amit Patel',
      bidAmount: 4200,
      proposalExcerpt: 'Expert plumber with certified materials. Will provide 6 months warranty on the work.',
      status: BidStatus.PENDING,
      dateSubmitted: new Date(Date.now() - 30 * 60 * 1000),
      rating: 4.8,
    },
    {
      id: '3',
      contractorName: 'Suresh Singh',
      bidAmount: 2800,
      proposalExcerpt: 'Quick and affordable service. Available immediately to fix your plumbing issue.',
      status: BidStatus.PENDING,
      dateSubmitted: new Date(Date.now() - 10 * 60 * 1000),
      rating: 4.2,
    },
  ]);

  // Load data on mount
  useEffect(() => {
    loadRequestDetails();
  }, []);

  const loadRequestDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to fetch request details and bids
      // const [requestData, bidsData] = await Promise.all([
      //   requestAPI.getRequestById(requestId),
      //   bidAPI.getBidsByRequestId(requestId),
      // ]);
      // setRequest(requestData);
      // setBids(bidsData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Load request error:', error);
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRequestDetails();
    setIsRefreshing(false);
  };

  // Handle bid acceptance
  const handleAcceptBid = (bidId: string) => {
    Alert.alert(
      'Accept Bid',
      'Are you sure you want to accept this bid? This will notify the contractor and mark the request as in progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              // TODO: Call API to accept bid
              // await bidAPI.acceptBid(bidId);
              
              Alert.alert('Success', 'Bid accepted successfully!');
              await loadRequestDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to accept bid');
            }
          },
        },
      ]
    );
  };

  // Handle request actions (edit, delete, cancel)
  const handleEditRequest = () => {
    setMenuVisible(false);
    Alert.alert('Edit Request', 'Edit functionality coming soon');
    // TODO: Navigate to edit screen
  };

  const handleCancelRequest = () => {
    setMenuVisible(false);
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to cancel request
              Alert.alert('Cancelled', 'Request has been cancelled');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRequest = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to delete request
              Alert.alert('Deleted', 'Request has been deleted');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete request');
            }
          },
        },
      ]
    );
  };

  // Calculate bid statistics
  const bidStats = {
    count: bids.length,
    avgAmount: bids.length > 0
      ? bids.reduce((sum, bid) => sum + bid.bidAmount, 0) / bids.length
      : 0,
    minAmount: bids.length > 0
      ? Math.min(...bids.map(bid => bid.bidAmount))
      : 0,
    maxAmount: bids.length > 0
      ? Math.max(...bids.map(bid => bid.bidAmount))
      : 0,
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render request details tab
  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{request.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={theme.colors.primary.main}
          />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.infoText}>{request.locationAddress}</Text>
        <Text style={styles.infoText}>
          {request.locationCity}, {request.locationState} - {request.locationPincode}
        </Text>
      </View>

      {/* Budget */}
      {(request.budgetMin || request.budgetMax) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cash"
              size={20}
              color={theme.colors.success as any}
            />
            <Text style={styles.sectionTitle}>Budget Range</Text>
          </View>
          <Text style={styles.budgetText}>
            {request.budgetMin && request.budgetMax
              ? `₹${request.budgetMin.toLocaleString('en-IN')} - ₹${request.budgetMax.toLocaleString('en-IN')}`
              : request.budgetMin
              ? `₹${request.budgetMin.toLocaleString('en-IN')}+`
              : `Up to ₹${request.budgetMax?.toLocaleString('en-IN')}`}
          </Text>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.section}>
        <View style={styles.timestampRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.timestampLabel}>Posted:</Text>
          <Text style={styles.timestampValue}>{formatDate(request.datePosted)}</Text>
        </View>
        <View style={styles.timestampRow}>
          <MaterialCommunityIcons
            name="update"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.timestampLabel}>Updated:</Text>
          <Text style={styles.timestampValue}>{formatDate(request.dateUpdated)}</Text>
        </View>
      </View>
    </View>
  );

  // Render bids tab
  const renderBidsTab = () => (
    <View style={styles.tabContent}>
      {/* Bid Statistics */}
      {bids.length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Bid Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bidStats.count}</Text>
              <Text style={styles.statLabel}>Total Bids</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{Math.round(bidStats.avgAmount).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{bidStats.minAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{bidStats.maxAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bid List */}
      {bids.length > 0 ? (
        bids.map(bid => (
          <BidCard
            key={bid.id}
            id={bid.id}
            contractorName={bid.contractorName}
            contractorAvatar={bid.contractorAvatar}
            bidAmount={bid.bidAmount}
            proposalExcerpt={bid.proposalExcerpt}
            status={bid.status}
            dateSubmitted={bid.dateSubmitted}
            rating={bid.rating}
            onPress={() => Alert.alert('Bid Details', 'Full bid details coming soon')}
            onAccept={bid.status === BidStatus.PENDING ? () => handleAcceptBid(bid.id) : undefined}
            showActions={request.status === RequestStatus.OPEN}
          />
        ))
      ) : (
        <EmptyState
          icon="📭"
          title="No Bids Yet"
          description="Contractors haven't submitted any bids for this request yet. Check back later!"
        />
      )}
    </View>
  );

  if (isLoading) {
    return <Loading message="Loading request details..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary.main]}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons
                name="hammer"
                size={16}
                color={theme.colors.primary.main}
              />
              <Text style={styles.categoryText}>{request.category}</Text>
            </View>
            <StatusChip status={request.status} variant="request" size="medium" />
          </View>
          
          <Text style={styles.title}>{request.title}</Text>

          {/* Action Buttons */}
          {request.status === RequestStatus.OPEN && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleEditRequest}
                style={styles.actionButton}
                icon="pencil"
                size="small"
              >
                Edit
              </Button>
              <Button
                mode="outlined"
                onPress={handleCancelRequest}
                style={[styles.actionButton, styles.cancelButton] as any}
                icon="close-circle"
                size="small"
              >
                Cancel
              </Button>
            </View>
          )}
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <Button
            mode={activeTab === 'details' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('details')}
            style={styles.tabButton}
          >
            Details
          </Button>
          <Button
            mode={activeTab === 'bids' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('bids')}
            style={styles.tabButton}
            icon="file-document"
          >
            {`Bids (${bids.length})`}
          </Button>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' ? renderDetailsTab() : renderBidsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  headerCard: {
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary.light + '20',
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  title: {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h5.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: theme.colors.error as any,
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonActive: {
    elevation: 0,
  },
  tabContent: {
    gap: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  infoText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  budgetText: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '600',
    color: theme.colors.success as any,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  timestampLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  timestampValue: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.primary,
  },
  statsCard: {
    backgroundColor: theme.colors.primary.light + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statsTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

export default RequestDetailsScreen;
