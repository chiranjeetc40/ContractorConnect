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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { SocietyStackScreenProps } from '../../types/navigation.types';
import { Request, RequestStatus } from '../../types/models.types';
import { requestAPI } from '../../api';
import RequestCard from '../../components/common/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

type Props = SocietyStackScreenProps<'SocietyHomeScreen'>;

const SocietyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RequestStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  // Load requests on mount
  React.useEffect(() => {
    console.log('🏢 [SocietyHomeScreen] Component mounted');
    loadRequests();
  }, []);

  // Load requests from API
  const loadRequests = async () => {
    try {
      console.log('📡 [SocietyHomeScreen] Loading requests...');
      setIsLoading(true);
      const response = await requestAPI.getMyRequests();
      console.log('✅ [SocietyHomeScreen] Requests loaded:', response.requests.length);
      setRequests(response.requests || []); // Handle empty array
    } catch (error: any) {
      console.error('❌ [SocietyHomeScreen] Error loading requests:', error);
      
      // Handle 404 or empty response gracefully
      if (error?.response?.status === 404 || !error?.response) {
        console.log('ℹ️ [SocietyHomeScreen] No requests found (empty state)');
        setRequests([]); // Set to empty array, don't show error
      } else {
        // Show error for other issues
        console.error('❌ [SocietyHomeScreen] API Error:', error?.response?.data || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    await loadRequests();
    setIsRefreshing(false);
  };

  // Handle request press
  const handleRequestPress = (requestId: string) => {
    navigation.navigate('RequestDetails', { requestId });
  };

  // Handle create new request
  const handleCreateRequest = () => {
    console.log('➕ [SocietyHomeScreen] Create request button pressed');
    navigation.navigate('CreateRequest');
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
  const renderRequest = ({ item }: { item: Request }) => (
    <RequestCard
      id={item.id}
      title={item.title}
      category={item.category}
      status={item.status}
      location={item.city} // Use city field
      budgetMin={item.budget_min}
      budgetMax={item.budget_max}
      datePosted={new Date(item.created_at)}
      bidCount={item.bids_count || 0}
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
        // actionLabel="Create Request"
        // onAction={handleCreateRequest}
      />
    );
  };

  if (isLoading) {
    console.log('⏳ [SocietyHomeScreen] Showing loading state');
    return <Loading message="Loading requests..." />;
  }

  console.log('🎨 [SocietyHomeScreen] Rendering home screen with', filteredRequests.length, 'requests');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          { paddingBottom: 120 } // Extra padding to account for FAB button
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
      {console.log('🔘 [SocietyHomeScreen] Rendering FAB button')}
      <FAB
        icon="plus"
        style={[
          styles.fab, 
          { 
            bottom: insets.bottom > 0 
              ? insets.bottom   // Add space for tab bar + padding
              : 80  // Default bottom position when no insets
          }
        ]}
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
