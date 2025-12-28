/**
 * Theme Configuration
 * Combines colors, typography, and spacing into a unified theme
 */

import { MD3LightTheme as PaperLightTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Light Theme for React Native Paper
export const lightTheme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    tertiary: colors.primary.dark,
    error: colors.error,
    background: colors.background.default,
    surface: colors.background.paper,
    surfaceVariant: colors.grey[100],
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    outline: colors.border.light,
    outlineVariant: colors.border.main,
  },
  roundness: borderRadius.md,
};

// Dark Theme for React Native Paper
export const darkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: colors.primary.light,
    primaryContainer: colors.primary.dark,
    secondary: colors.secondary.light,
    secondaryContainer: colors.secondary.dark,
    tertiary: colors.primary.main,
    error: colors.error,
    background: colors.background.dark,
    surface: colors.grey[900],
    surfaceVariant: colors.grey[800],
    onSurface: colors.text.white,
    onSurfaceVariant: colors.grey[400],
    outline: colors.grey[700],
    outlineVariant: colors.grey[600],
  },
  roundness: borderRadius.md,
};

// Combined Theme Export
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof theme;
