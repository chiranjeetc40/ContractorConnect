/**
 * Submit Bid Screen
 * Contractors submit bids on work requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { theme } from '../../theme/theme';
import { ContractorStackScreenProps } from '../../types/navigation.types';
import { RequestStatus } from '../../types/models.types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import StatusChip from '../../components/common/StatusChip';

type Props = ContractorStackScreenProps<'SubmitBid'>;

interface FormData {
  bidAmount: string;
  proposal: string;
  estimatedDays: string;
}

interface FormErrors {
  bidAmount?: string;
  proposal?: string;
  estimatedDays?: string;
}

interface MockRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  locationCity: string;
  budgetMin?: number;
  budgetMax?: number;
  societyName: string;
  datePosted: Date;
}

const SubmitBidScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  
  const [formData, setFormData] = useState<FormData>({
    bidAmount: '',
    proposal: '',
    estimatedDays: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);

  // TODO: Replace with actual API data
  const [request, setRequest] = useState<MockRequest>({
    id: requestId,
    title: 'Fix Leaking Pipe in Bathroom',
    description: 'There is a major leak in the bathroom sink pipe. Water is dripping continuously and needs immediate attention. The pipe appears to be old and may need replacement.',
    category: 'Plumbing',
    status: RequestStatus.OPEN,
    locationCity: 'Mumbai',
    budgetMin: 2000,
    budgetMax: 5000,
    societyName: 'Sunshine Apartments',
    datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  // Mock existing bids for statistics
  const [existingBids] = useState([
    { amount: 3500 },
    { amount: 4200 },
    { amount: 2800 },
  ]);

  // Calculate bid statistics
  const bidStats = {
    count: existingBids.length,
    avgAmount: existingBids.length > 0
      ? Math.round(existingBids.reduce((sum, bid) => sum + bid.amount, 0) / existingBids.length)
      : 0,
    minAmount: existingBids.length > 0
      ? Math.min(...existingBids.map(bid => bid.amount))
      : 0,
    maxAmount: existingBids.length > 0
      ? Math.max(...existingBids.map(bid => bid.amount))
      : 0,
  };

  useEffect(() => {
    loadRequestDetails();
  }, []);

  const loadRequestDetails = async () => {
    setIsLoadingRequest(true);
    try {
      // TODO: Call API to fetch request details
      // const data = await requestAPI.getRequestById(requestId);
      // setRequest(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Load request error:', error);
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setIsLoadingRequest(false);
    }
  };

  // Update form field
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Bid amount validation
    if (!formData.bidAmount.trim()) {
      newErrors.bidAmount = 'Bid amount is required';
    } else if (isNaN(Number(formData.bidAmount))) {
      newErrors.bidAmount = 'Must be a valid number';
    } else if (Number(formData.bidAmount) <= 0) {
      newErrors.bidAmount = 'Amount must be greater than 0';
    } else if (request.budgetMax && Number(formData.bidAmount) > request.budgetMax * 1.5) {
      newErrors.bidAmount = 'Amount seems too high for this request';
    }

    // Proposal validation
    if (!formData.proposal.trim()) {
      newErrors.proposal = 'Proposal is required';
    } else if (formData.proposal.trim().length < 50) {
      newErrors.proposal = 'Proposal must be at least 50 characters';
    }

    // Estimated days validation (optional but must be valid if provided)
    if (formData.estimatedDays && isNaN(Number(formData.estimatedDays))) {
      newErrors.estimatedDays = 'Must be a valid number';
    } else if (formData.estimatedDays && Number(formData.estimatedDays) <= 0) {
      newErrors.estimatedDays = 'Must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to submit bid
      // const response = await bidAPI.submitBid({
      //   request_id: requestId,
      //   bid_amount: Number(formData.bidAmount),
      //   proposal: formData.proposal.trim(),
      //   estimated_completion_days: formData.estimatedDays ? Number(formData.estimatedDays) : undefined,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Your bid has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit bid error:', error);
      Alert.alert(
        'Error',
        'Failed to submit bid. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRequest) {
    return <Loading message="Loading request details..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Request Summary Card */}
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.categoryBadge}>
                <MaterialCommunityIcons
                  name="hammer"
                  size={16}
                  color={theme.colors.primary.main}
                />
                <Text style={styles.categoryText}>{request.category}</Text>
              </View>
              <StatusChip status={request.status} variant="request" size="small" />
            </View>

            <Text style={styles.requestTitle}>{request.title}</Text>
            
            <View style={styles.requestInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={16}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.infoText}>{request.societyName}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.infoText}>{request.locationCity}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={3}>
              {request.description}
            </Text>

            {(request.budgetMin || request.budgetMax) && (
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetLabel}>Budget Range:</Text>
                <Text style={styles.budgetValue}>
                  {request.budgetMin && request.budgetMax
                    ? `₹${request.budgetMin.toLocaleString('en-IN')} - ₹${request.budgetMax.toLocaleString('en-IN')}`
                    : request.budgetMin
                    ? `₹${request.budgetMin.toLocaleString('en-IN')}+`
                    : `Up to ₹${request.budgetMax?.toLocaleString('en-IN')}`}
                </Text>
              </View>
            )}
          </View>

          {/* Bid Statistics */}
          {existingBids.length > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>
                💡 Bid Statistics ({bidStats.count} {bidStats.count === 1 ? 'bid' : 'bids'})
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average</Text>
                  <Text style={styles.statValue}>₹{bidStats.avgAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Lowest</Text>
                  <Text style={styles.statValue}>₹{bidStats.minAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Highest</Text>
                  <Text style={styles.statValue}>₹{bidStats.maxAmount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Bid Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Your Bid</Text>

            <Input
              label="Bid Amount"
              value={formData.bidAmount}
              onChangeText={(value) => updateField('bidAmount', value)}
              error={errors.bidAmount}
              required
              placeholder="Enter your bid amount"
              leftIcon="currency-inr"
              keyboardType="number-pad"
              helperText={bidStats.avgAmount > 0 ? `Avg: ₹${bidStats.avgAmount.toLocaleString('en-IN')}` : undefined}
            />

            <Input
              label="Work Proposal"
              value={formData.proposal}
              onChangeText={(value) => updateField('proposal', value)}
              error={errors.proposal}
              required
              placeholder="Describe your experience, approach, and why you're the best fit..."
              leftIcon="text"
              multiline
              numberOfLines={8}
              helperText={`${formData.proposal.length}/500 characters (min 50)`}
              maxLength={500}
              style={styles.textArea}
            />

            <Input
              label="Estimated Completion"
              value={formData.estimatedDays}
              onChangeText={(value) => updateField('estimatedDays', value)}
              error={errors.estimatedDays}
              placeholder="Number of days"
              leftIcon="calendar"
              keyboardType="number-pad"
              helperText="How many days will you need to complete this work?"
            />

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tipText}>• Be competitive but fair with your pricing</Text>
              <Text style={styles.tipText}>• Highlight your experience in your proposal</Text>
              <Text style={styles.tipText}>• Provide a realistic timeline</Text>
              <Text style={styles.tipText}>• Mention materials if included in price</Text>
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit}
              mode="contained"
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              icon="send"
            >
              Submit Bid
            </Button>

            {/* Cancel Button */}
            <Button
              onPress={() => navigation.goBack()}
              mode="outlined"
              disabled={isLoading}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <Loading message="Submitting your bid..." fullScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  requestCard: {
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
  requestHeader: {
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
  requestTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.h6.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  requestInfo: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  description: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey[200],
  },
  budgetLabel: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
  },
  budgetValue: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.success as any,
  },
  statsCard: {
    backgroundColor: theme.colors.primary.light + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  formSection: {
    gap: theme.spacing.sm,
  },
  formTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  tipsCard: {
    backgroundColor: theme.colors.warning + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  tipsTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
});

export default SubmitBidScreen;
