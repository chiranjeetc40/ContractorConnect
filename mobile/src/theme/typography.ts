/**
 * Typography System
 * Consistent text styles throughout the app
 */

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  
  // Subtitles
  subtitle1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Body
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  // Button
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.75,
    textTransform: 'uppercase' as const,
  },
  
  // Caption & Overline
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

export type Typography = typeof typography;
