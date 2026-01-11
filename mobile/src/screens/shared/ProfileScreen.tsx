/**
 * Profile Screen
 * Displays user information and settings
 * Used by both Contractor and Society users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../theme/theme';
import { UserRole } from '../../types/models.types';

const ProfileScreen: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await clearAuth();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    // Remove +91 prefix if exists
    const cleaned = phone.replace('+91', '');
    // Format as XXX XXX XXXX
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.CONTRACTOR:
        return theme.colors.primary.main;
      case UserRole.SOCIETY:
        return theme.colors.secondary.main;
      case UserRole.ADMIN:
        return theme.colors.error;
      default:
        return theme.colors.grey[500];
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.CONTRACTOR:
        return 'Contractor';
      case UserRole.SOCIETY:
        return 'Society Manager';
      case UserRole.ADMIN:
        return 'Administrator';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getRoleBadgeColor(user.role) }]}>
            <Text style={styles.avatarText}>
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          {user.is_verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user.full_name || 'User'}</Text>
        
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
          <Text style={styles.roleBadgeText}>{getRoleDisplayName(user.role)}</Text>
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <InfoItem
          icon="phone"
          label="Phone Number"
          value={formatPhoneNumber(user.phone_number)}
        />
        
        {user.email && (
          <InfoItem
            icon="email"
            label="Email"
            value={user.email}
          />
        )}
        
        <InfoItem
          icon="shield-check"
          label="Account Status"
          value={user.is_verified ? 'Verified' : 'Not Verified'}
          valueColor={user.is_verified ? theme.colors.success : theme.colors.warning}
        />
        
        <InfoItem
          icon="calendar"
          label="Member Since"
          value={formatDate(user.created_at)}
        />
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <ActionButton
          icon="account-edit"
          label="Edit Profile"
          onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
        />
        
        <ActionButton
          icon="bell"
          label="Notifications"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
        />
        
        <ActionButton
          icon="help-circle"
          label="Help & Support"
          onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon!')}
        />
        
        <ActionButton
          icon="information"
          label="About"
          onPress={() => Alert.alert('ContractorConnect', 'Version 1.0.0\n\nConnecting societies with trusted contractors.')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator size="small" color={theme.colors.background.default} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={theme.colors.background.default}
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          User ID: {user.id}
        </Text>
      </View>
    </ScrollView>
  );
};

// ============ Info Item Component ============

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoItemLeft}>
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={theme.colors.grey[600]}
      />
      <Text style={styles.infoItemLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoItemValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

// ============ Action Button Component ============

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.actionButtonLeft}>
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={theme.colors.primary.main}
      />
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </View>
    <MaterialCommunityIcons
      name="chevron-right"
      size={24}
      color={theme.colors.grey[400]}
    />
  </TouchableOpacity>
);

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grey[50],
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.grey[50],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.grey[600],
  },
  
  // Header Card
  headerCard: {
    backgroundColor: theme.colors.background.default,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[200],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.background.default,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.background.default,
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.background.default,
  },
  
  // Section
  section: {
    backgroundColor: theme.colors.background.default,
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.grey[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  
  // Info Item
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[100],
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginLeft: 12,
  },
  infoItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  
  // Action Button
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[100],
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background.default,
  },
  
  // Footer
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.grey[500],
  },
});

export default ProfileScreen;
