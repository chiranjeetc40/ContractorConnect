/**
 * Browse Requests Screen
 * Contractors can browse all available work requests
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { FAB, Searchbar, Chip, Menu, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { ContractorStackScreenProps } from '../../types/navigation.types';
import { RequestStatus } from '../../types/models.types';
import { APP_CONFIG } from '../../config/app.config';
import RequestCard from '../../components/common/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

type Props = ContractorStackScreenProps<'BrowseRequests'>;

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
  societyName: string;
}

const BrowseRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);
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
      datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      bidCount: 3,
      societyName: 'Sunshine Apartments',
    },
    {
      id: '2',
      title: 'Electrical Wiring for New Room',
      category: 'Electrical',
      status: RequestStatus.OPEN,
      location: 'Mumbai',
      budgetMin: 15000,
      budgetMax: 25000,
      datePosted: new Date(Date.now() - 5 * 60 * 60 * 1000),
      bidCount: 2,
      societyName: 'Green Valley Society',
    },
    {
      id: '3',
      title: 'Painting for Living Room',
      category: 'Painting',
      status: RequestStatus.OPEN,
      location: 'Pune',
      budgetMin: 10000,
      budgetMax: 15000,
      datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      bidCount: 5,
      societyName: 'Royal Heights',
    },
    {
      id: '4',
      title: 'Deep Cleaning of 3BHK Flat',
      category: 'Cleaning',
      status: RequestStatus.OPEN,
      location: 'Mumbai',
      budgetMin: 3000,
      budgetMax: 5000,
      datePosted: new Date(Date.now() - 6 * 60 * 60 * 1000),
      bidCount: 8,
      societyName: 'Lake View Residency',
    },
    {
      id: '5',
      title: 'Carpenter Work for Kitchen Cabinets',
      category: 'Carpentry',
      status: RequestStatus.OPEN,
      location: 'Pune',
      budgetMin: 20000,
      budgetMax: 30000,
      datePosted: new Date(Date.now() - 12 * 60 * 60 * 1000),
      bidCount: 4,
      societyName: 'Sai Residency',
    },
  ]);

  // Filter options
  const categories = ['All', ...APP_CONFIG.REQUEST_CATEGORIES];
  const cities = ['All', 'Mumbai', 'Pune', 'Bangalore', 'Delhi'];

  // Filtered requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.societyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || request.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || request.location === selectedCity;
    return matchesSearch && matchesCategory && matchesCity && request.status === RequestStatus.OPEN;
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRequests();
    setIsRefreshing(false);
  };

  // Handle request press
  const handleRequestPress = (requestId: string) => {
    // TODO: Navigate to Request Details (contractor view)
    // navigation.navigate('RequestDetails', { requestId });
    // For now, go to Submit Bid
    navigation.navigate('SubmitBid', { requestId });
  };

  // Render request card
  const renderRequest = ({ item }: { item: MockRequest }) => (
    <View>
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
      <Text style={styles.societyName}>📍 {item.societyName}</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery || selectedCategory !== 'All' || selectedCity !== 'All') {
      return (
        <EmptyState
          icon="🔍"
          title="No Requests Found"
          description="Try adjusting your filters or search query"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedCity('All');
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="📭"
        title="No Available Work"
        description="Check back later for new work requests from societies"
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

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setCategoryMenuVisible(true)}
              icon="folder"
              style={styles.filterButton}
            >
              {selectedCategory}
            </Button>
          }
        >
          {categories.map(category => (
            <Menu.Item
              key={category}
              onPress={() => {
                setSelectedCategory(category);
                setCategoryMenuVisible(false);
              }}
              title={category}
              leadingIcon={selectedCategory === category ? 'check' : undefined}
            />
          ))}
        </Menu>

        <Menu
          visible={cityMenuVisible}
          onDismiss={() => setCityMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setCityMenuVisible(true)}
              icon="map-marker"
              style={styles.filterButton}
            >
              {selectedCity}
            </Button>
          }
        >
          {cities.map(city => (
            <Menu.Item
              key={city}
              onPress={() => {
                setSelectedCity(city);
                setCityMenuVisible(false);
              }}
              title={city}
              leadingIcon={selectedCity === city ? 'check' : undefined}
            />
          ))}
        </Menu>
      </View>

      {/* Active Filters Display */}
      {(selectedCategory !== 'All' || selectedCity !== 'All') && (
        <View style={styles.activeFilters}>
          {selectedCategory !== 'All' && (
            <Chip
              onClose={() => setSelectedCategory('All')}
              style={styles.activeFilterChip}
            >
              {selectedCategory}
            </Chip>
          )}
          {selectedCity !== 'All' && (
            <Chip
              onClose={() => setSelectedCity('All')}
              style={styles.activeFilterChip}
            >
              {selectedCity}
            </Chip>
          )}
        </View>
      )}

      {/* Statistics Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} available
        </Text>
      </View>

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
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary.light + '20',
  },
  statsBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.grey[100],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[200],
  },
  statsText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  societyName: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
});

export default BrowseRequestsScreen;
