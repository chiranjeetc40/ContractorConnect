/**
 * My Bids Screen
 * Contractors can view and manage all their submitted bids
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { Bid, BidStatus } from '../../types/models.types';
import { bidAPI } from '../../api';
import BidCard from '../../components/common/BidCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

const MyBidsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | BidStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    loadBids();
  }, []);

  // Load bids from API
  const loadBids = async () => {
    try {
      const response = await bidAPI.getMyBids();
      setBids(response.bids);
    } catch (error: any) {
      console.error('Load bids error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to load bids';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter buttons
  const filters: { label: string; value: 'all' | BidStatus; count: number }[] = [
    { label: 'All', value: 'all', count: bids.length },
    { label: 'Pending', value: BidStatus.PENDING, count: bids.filter(b => b.status === BidStatus.PENDING).length },
    { label: 'Accepted', value: BidStatus.ACCEPTED, count: bids.filter(b => b.status === BidStatus.ACCEPTED).length },
    { label: 'Rejected', value: BidStatus.REJECTED, count: bids.filter(b => b.status === BidStatus.REJECTED).length },
  ];

  // Filtered bids
  const filteredBids = bids.filter(bid => {
    if (selectedFilter === 'all') return true;
    return bid.status === selectedFilter;
  });

  // Sort by date (newest first)
  const sortedBids = [...filteredBids].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBids();
  };

  // Handle bid press
  const handleBidPress = (bidId: string) => {
    Alert.alert('Bid Details', 'Full bid details view coming soon');
    // TODO: Navigate to bid details
  };

  // Handle withdraw bid
  const handleWithdrawBid = async (bidId: string) => {
    Alert.alert(
      'Withdraw Bid',
      'Are you sure you want to withdraw this bid? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await bidAPI.withdrawBid(bidId);
              
              // Reload bids to get updated data
              await loadBids();
              
              Alert.alert('Success', 'Bid withdrawn successfully');
            } catch (error: any) {
              console.error('Withdraw bid error:', error);
              
              const errorMessage = error.response?.data?.detail || 
                                  error.response?.data?.message ||
                                  'Failed to withdraw bid';
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  // Render filter chips
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <Chip
            selected={selectedFilter === item.value}
            onPress={() => setSelectedFilter(item.value)}
            style={[
              styles.filterChip,
              selectedFilter === item.value && styles.filterChipSelected,
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === item.value && styles.filterChipTextSelected,
            ]}
          >
            {item.label} ({item.count})
          </Chip>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  // Render bid card
  const renderBid = ({ item }: { item: Bid }) => (
    <View style={styles.bidContainer}>
      <Text style={styles.requestTitle}>{item.request?.title || 'Request'}</Text>
      <Text style={styles.societyName}>📍 {item.request?.society?.full_name || 'N/A'}</Text>
      
      <BidCard
        id={item.id}
        contractorName="You"
        bidAmount={item.amount}
        proposalExcerpt={item.proposal.length > 100 ? `${item.proposal.substring(0, 100)}...` : item.proposal}
        status={item.status}
        dateSubmitted={new Date(item.created_at)}
        onPress={() => handleBidPress(item.id)}
        onWithdraw={item.status === BidStatus.PENDING ? () => handleWithdrawBid(item.id) : undefined}
        showActions={item.status === BidStatus.PENDING}
      />
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (selectedFilter !== 'all') {
      return (
        <EmptyState
          icon="📋"
          title="No Bids"
          description={`You don't have any ${selectedFilter.toLowerCase()} bids`}
          actionLabel="View All"
          onAction={() => setSelectedFilter('all')}
        />
      );
    }

    return (
      <EmptyState
        icon="📭"
        title="No Bids Yet"
        description="Start browsing work requests and submit your first bid!"
      />
    );
  };

  // Calculate statistics
  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === BidStatus.PENDING).length,
    accepted: bids.filter(b => b.status === BidStatus.ACCEPTED).length,
    rejected: bids.filter(b => b.status === BidStatus.REJECTED).length,
    totalValue: bids.reduce((sum, bid) => sum + bid.amount, 0),
    acceptedValue: bids
      .filter(b => b.status === BidStatus.ACCEPTED)
      .reduce((sum, bid) => sum + bid.amount, 0),
  };

  if (isLoading) {
    return <Loading message="Loading your bids..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Statistics Card */}
      {bids.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Bids</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.pendingColor]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.acceptedColor]}>{stats.accepted}</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.rejectedColor]}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
          {stats.accepted > 0 && (
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Accepted Bid Value:</Text>
              <Text style={styles.valueAmount}>
                ₹{stats.acceptedValue.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Bid List */}
      <FlatList
        data={sortedBids}
        renderItem={renderBid}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          sortedBids.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  statsCard: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  pendingColor: {
    color: theme.colors.warning as any,
  },
  acceptedColor: {
    color: theme.colors.success as any,
  },
  rejectedColor: {
    color: theme.colors.error as any,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey[200],
    gap: theme.spacing.xs,
  },
  valueLabel: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  valueAmount: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '700',
    color: theme.colors.success as any,
  },
  filterContainer: {
    paddingVertical: theme.spacing.xs,
  },
  filterList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  filterChip: {
    marginRight: theme.spacing.xs,
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  filterChipText: {
    color: theme.colors.text.secondary,
  },
  filterChipTextSelected: {
    color: theme.colors.background.default,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  bidContainer: {
    marginBottom: theme.spacing.lg,
  },
  requestTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  societyName: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
});

export default MyBidsScreen;
