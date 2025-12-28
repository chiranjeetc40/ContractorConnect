/**
 * Society Home Screen
 * Display all requests created by the society with filters
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { FAB, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { SocietyTabScreenProps } from '../../types/navigation.types';
import { RequestStatus } from '../../types/models.types';
import RequestCard from '../../components/common/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

type Props = SocietyTabScreenProps<'SocietyHome'>;

interface MockRequest {
  id: string;
  title: string;
  category: string;
  status: RequestStatus;
  location: string;
  budgetMin?: number;
  budgetMax?: number;
  datePosted: Date;
  bidCount: number;
}

const SocietyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RequestStatus>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TODO: Replace with actual API data
  const [requests, setRequests] = useState<MockRequest[]>([
    {
      id: '1',
      title: 'Fix Leaking Pipe in Bathroom',
      category: 'Plumbing',
      status: RequestStatus.OPEN,
      location: 'Mumbai',
      budgetMin: 2000,
      budgetMax: 5000,
      datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      bidCount: 3,
    },
    {
      id: '2',
      title: 'Electrical Wiring for New Room',
      category: 'Electrical',
      status: RequestStatus.IN_PROGRESS,
      location: 'Mumbai',
      budgetMin: 15000,
      budgetMax: 25000,
      datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      bidCount: 7,
    },
    {
      id: '3',
      title: 'Painting for Living Room',
      category: 'Painting',
      status: RequestStatus.COMPLETED,
      location: 'Mumbai',
      budgetMin: 10000,
      budgetMax: 15000,
      datePosted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      bidCount: 5,
    },
  ]);

  // Filter buttons
  const filters: { label: string; value: 'all' | RequestStatus; count: number }[] = [
    { label: 'All', value: 'all', count: requests.length },
    { label: 'Open', value: RequestStatus.OPEN, count: requests.filter(r => r.status === RequestStatus.OPEN).length },
    { label: 'In Progress', value: RequestStatus.IN_PROGRESS, count: requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length },
    { label: 'Completed', value: RequestStatus.COMPLETED, count: requests.filter(r => r.status === RequestStatus.COMPLETED).length },
  ];

  // Filtered requests based on search and filter
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Call API to fetch latest requests
    // await requestAPI.getMyRequests();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Handle request press
  const handleRequestPress = (requestId: string) => {
    // TODO: Navigate to Request Details screen
    // navigation.navigate('RequestDetails', { requestId });
    console.log('Navigate to request:', requestId);
  };

  // Handle create new request
  const handleCreateRequest = () => {
    // TODO: Navigate to Create Request screen
    // navigation.navigate('CreateRequest');
    console.log('Navigate to create request');
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

  // Render request card
  const renderRequest = ({ item }: { item: MockRequest }) => (
    <RequestCard
      id={item.id}
      title={item.title}
      category={item.category}
      status={item.status}
      location={item.location}
      budgetMin={item.budgetMin}
      budgetMax={item.budgetMax}
      datePosted={item.datePosted}
      bidCount={item.bidCount}
      onPress={() => handleRequestPress(item.id)}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <EmptyState
          icon="🔍"
          title="No Results Found"
          description={`No requests match "${searchQuery}"`}
        />
      );
    }

    if (selectedFilter !== 'all') {
      return (
        <EmptyState
          icon="📋"
          title="No Requests"
          description={`You don't have any ${selectedFilter.toLowerCase().replace('_', ' ')} requests`}
        />
      );
    }

    return (
      <EmptyState
        icon="📭"
        title="No Requests Yet"
        description="Create your first request to get started with finding contractors"
        actionLabel="Create Request"
        onAction={handleCreateRequest}
      />
    );
  };

  if (isLoading) {
    return <Loading message="Loading requests..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search requests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary.main}
        />
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Request List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredRequests.length === 0 && styles.emptyListContent,
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

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateRequest}
        label="New Request"
        color={theme.colors.background.default}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: theme.colors.background.paper,
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
  fab: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
  },
});

export default SocietyHomeScreen;
