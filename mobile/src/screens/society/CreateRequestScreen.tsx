/**
 * Create Request Screen
 * Form for society users to create new work requests
 */

import React, { useState } from 'react';
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
import { theme } from '../../theme/theme';
import { SocietyStackScreenProps } from '../../types/navigation.types';
import { APP_CONFIG } from '../../config/app.config';
import { requestAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type Props = SocietyStackScreenProps<'CreateRequest'>;

interface FormData {
  title: string;
  category: string;
  description: string;
  locationAddress: string;
  locationCity: string;
  locationState: string;
  locationPincode: string;
  budgetMin: string;
  budgetMax: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  description?: string;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  locationPincode?: string;
  budgetMin?: string;
  budgetMax?: string;
}

const CreateRequestScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationPincode: '',
    budgetMin: '',
    budgetMax: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    // Location validations
    if (!formData.locationAddress.trim()) {
      newErrors.locationAddress = 'Address is required';
    }

    if (!formData.locationCity.trim()) {
      newErrors.locationCity = 'City is required';
    }

    if (!formData.locationState.trim()) {
      newErrors.locationState = 'State is required';
    }

    if (!formData.locationPincode.trim()) {
      newErrors.locationPincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.locationPincode)) {
      newErrors.locationPincode = 'Pincode must be 6 digits';
    }

    // Budget validation (optional but must be valid if provided)
    if (formData.budgetMin && isNaN(Number(formData.budgetMin))) {
      newErrors.budgetMin = 'Must be a valid number';
    }

    if (formData.budgetMax && isNaN(Number(formData.budgetMax))) {
      newErrors.budgetMax = 'Must be a valid number';
    }

    if (
      formData.budgetMin &&
      formData.budgetMax &&
      Number(formData.budgetMin) > Number(formData.budgetMax)
    ) {
      newErrors.budgetMax = 'Max budget must be greater than min budget';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    updateField('category', category);
    setShowCategoryPicker(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('📝 [CreateRequestScreen] Submit button pressed');
    
    if (!validateForm()) {
      console.log('⚠️ [CreateRequestScreen] Validation failed');
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    console.log('✅ [CreateRequestScreen] Validation passed');
    setIsLoading(true);

    try {
      const requestData = {
        title: formData.title.trim(),
        category: formData.category.toLowerCase(), // Convert to lowercase for backend enum
        description: formData.description.trim(),
        location: formData.locationAddress.trim(), // Backend expects 'location' not 'location_address'
        city: formData.locationCity.trim(), // Backend expects 'city'
        state: formData.locationState.trim(), // Backend expects 'state'
        pincode: formData.locationPincode.trim(), // Backend expects 'pincode'
        budget_min: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budget_max: formData.budgetMax ? Number(formData.budgetMax) : undefined,
      };
      
      console.log('📡 [CreateRequestScreen] Sending request:', requestData);
      
      // Call API to create request
      const response = await requestAPI.createRequest(requestData);
      
      console.log('✅ [CreateRequestScreen] Request created:', response);

      Alert.alert(
        'Success',
        'Your request has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ [CreateRequestScreen] Error:', error);
      console.error('❌ [CreateRequestScreen] Response:', error.response?.data);
      console.error('❌ [CreateRequestScreen] Status:', error.response?.status);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to create request. Please try again.';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
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

  // Render category picker
  const renderCategoryPicker = () => (
    <View style={styles.categoryGrid}>
      {APP_CONFIG.REQUEST_CATEGORIES.map(category => (
        <Button
          key={category}
          mode={formData.category === category ? 'contained' : 'outlined'}
          onPress={() => handleCategorySelect(category)}
          style={styles.categoryButton}
          icon={getCategoryIcon(category) as any}
        >
          {category}
        </Button>
      ))}
    </View>
  );

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
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="clipboard-text"
              size={48}
              color={theme.colors.primary.main}
            />
            <Text style={styles.headerTitle}>Create New Request</Text>
            <Text style={styles.headerSubtitle}>
              Fill in the details to find the right contractor
            </Text>
          </View>

          {/* Title */}
          <Input
            label="Request Title"
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            error={errors.title}
            required
            placeholder="e.g., Fix Leaking Pipe in Bathroom"
            leftIcon="format-title"
            helperText={`${formData.title.length}/100 characters (min 10)`}
            maxLength={100}
          />

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
            {renderCategoryPicker()}
          </View>

          {/* Description */}
          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            error={errors.description}
            required
            placeholder="Describe the work needed in detail..."
            leftIcon="text"
            multiline
            numberOfLines={6}
            helperText={`${formData.description.length}/500 characters (min 50)`}
            maxLength={500}
            style={styles.textArea}
          />

          {/* Location Section */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.colors.primary.main}
            />
            <Text style={styles.sectionTitle}>Location Details</Text>
          </View>

          <Input
            label="Address"
            value={formData.locationAddress}
            onChangeText={(value) => updateField('locationAddress', value)}
            error={errors.locationAddress}
            required
            placeholder="Building name, street, area"
            leftIcon="home"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="City"
                value={formData.locationCity}
                onChangeText={(value) => updateField('locationCity', value)}
                error={errors.locationCity}
                required
                placeholder="Mumbai"
                leftIcon="city"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="State"
                value={formData.locationState}
                onChangeText={(value) => updateField('locationState', value)}
                error={errors.locationState}
                required
                placeholder="Maharashtra"
                leftIcon="map"
              />
            </View>
          </View>

          <Input
            label="Pincode"
            value={formData.locationPincode}
            onChangeText={(value) => updateField('locationPincode', value)}
            error={errors.locationPincode}
            required
            placeholder="400001"
            leftIcon="mailbox"
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Budget Section */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cash"
              size={20}
              color={theme.colors.success as any}
            />
            <Text style={styles.sectionTitle}>Budget Range (Optional)</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Minimum Budget"
                value={formData.budgetMin}
                onChangeText={(value) => updateField('budgetMin', value)}
                error={errors.budgetMin}
                placeholder="₹ 2000"
                leftIcon="currency-inr"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Maximum Budget"
                value={formData.budgetMax}
                onChangeText={(value) => updateField('budgetMax', value)}
                error={errors.budgetMax}
                placeholder="₹ 5000"
                leftIcon="currency-inr"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            mode="contained"
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            icon="check-circle"
          >
            Create Request
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
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <Loading message="Creating your request..." fullScreen />}
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.h5.fontWeight,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error as any,
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error as any,
    marginBottom: theme.spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    width: '48%',
    marginBottom: 0,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
});

export default CreateRequestScreen;
