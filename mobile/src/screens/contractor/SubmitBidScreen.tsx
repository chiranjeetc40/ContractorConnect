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
import { Request, RequestStatus } from '../../types/models.types';
import { requestAPI, bidAPI } from '../../api';
import type { BidStatistics } from '../../api/bid.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import StatusChip from '../../components/common/StatusChip';

type Props = ContractorStackScreenProps<'SubmitBid'>;

interface FormData {
  bidAmount: string;
  proposal: string;
}

interface FormErrors {
  bidAmount?: string;
  proposal?: string;
}

const SubmitBidScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  
  const [formData, setFormData] = useState<FormData>({
    bidAmount: '',
    proposal: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [request, setRequest] = useState<Request | null>(null);
  const [bidStats, setBidStats] = useState<BidStatistics>({
    total_bids: 0,
    average_bid: 0,
    lowest_bid: 0,
    highest_bid: 0,
    pending_count: 0,
    accepted_count: 0,
    rejected_count: 0,
  });

  useEffect(() => {
    loadRequestDetails();
  }, []);

  const loadRequestDetails = async () => {
    setIsLoadingRequest(true);
    try {
      // Load request details
      const requestData = await requestAPI.getRequestById(requestId);
      setRequest(requestData);
      
      // Load bid statistics
      try {
        const stats = await bidAPI.getBidStatistics(requestId);
        setBidStats(stats);
      } catch (statsError) {
        // Statistics might not be available if no bids yet
        console.log('No bid statistics available yet');
      }
    } catch (error: any) {
      console.error('Load request error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to load request details';
      
      Alert.alert('Error', errorMessage, [
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
        },
      ]);
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
    } else if (request?.budget_max && Number(formData.bidAmount) > request.budget_max * 1.5) {
      newErrors.bidAmount = 'Amount seems too high for this request';
    }

    // Proposal validation
    if (!formData.proposal.trim()) {
      newErrors.proposal = 'Proposal is required';
    } else if (formData.proposal.trim().length < 50) {
      newErrors.proposal = 'Proposal must be at least 50 characters';
    } else if (formData.proposal.trim().length > 2000) {
      newErrors.proposal = 'Proposal must not exceed 2000 characters';
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
      // Call API to submit bid
      const response = await bidAPI.submitBid({
        request_id: Number(requestId), // Ensure it's a number
        amount: Number(formData.bidAmount), // Use 'amount' not 'bid_amount'
        proposal: formData.proposal.trim(),
      });

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
    } catch (error: any) {
      console.error('Submit bid error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to submit bid. Please try again.';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRequest) {
    return <Loading message="Loading request details..." />;
  }

  if (!request) {
    return <Loading message="Request not found" />;
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
                <Text style={styles.infoText}>{request.society?.full_name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.infoText}>{request.city}</Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={3}>
              {request.description}
            </Text>

            {(request.budget_min || request.budget_max) && (
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetLabel}>Budget Range:</Text>
                <Text style={styles.budgetValue}>
                  {request.budget_min && request.budget_max
                    ? `₹${request.budget_min.toLocaleString('en-IN')} - ₹${request.budget_max.toLocaleString('en-IN')}`
                    : request.budget_min
                    ? `₹${request.budget_min.toLocaleString('en-IN')}+`
                    : `Up to ₹${request.budget_max?.toLocaleString('en-IN')}`}
                </Text>
              </View>
            )}
          </View>

          {/* Bid Statistics */}
          {bidStats.total_bids > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>
                💡 Bid Statistics ({bidStats.total_bids} {bidStats.total_bids === 1 ? 'bid' : 'bids'})
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average</Text>
                  <Text style={styles.statValue}>₹{Math.round(bidStats.average_bid).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Lowest</Text>
                  <Text style={styles.statValue}>₹{bidStats.lowest_bid.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Highest</Text>
                  <Text style={styles.statValue}>₹{bidStats.highest_bid.toLocaleString('en-IN')}</Text>
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
              helperText={bidStats.average_bid > 0 ? `Avg: ₹${Math.round(bidStats.average_bid).toLocaleString('en-IN')}` : undefined}
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
              helperText={`${formData.proposal.length}/2000 characters (min 50)`}
              maxLength={2000}
              style={styles.textArea}
            />

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tipText}>• Be competitive but fair with your pricing</Text>
              <Text style={styles.tipText}>• Highlight your experience in your proposal</Text>
              <Text style={styles.tipText}>• Provide a realistic timeline in your proposal</Text>
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
