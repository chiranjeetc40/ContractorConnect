/**
 * Color Palette
 * Modern, professional color scheme
 */

export const colors = {
  // Primary (Blue - Trust, Professional)
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },
  
  // Secondary (Orange - Action, Energy)
  secondary: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrast: '#FFFFFF',
  },
  
  // Semantic Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Backgrounds
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    dark: '#121212',
  },
  
  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    white: '#FFFFFF',
  },
  
  // Status Colors
  status: {
    open: '#4CAF50',
    inProgress: '#2196F3',
    completed: '#9C27B0',
    cancelled: '#F44336',
    onHold: '#FF9800',
  },
  
  // Bid Status
  bidStatus: {
    pending: '#FF9800',
    accepted: '#4CAF50',
    rejected: '#F44336',
    withdrawn: '#9E9E9E',
  },
  
  // Borders
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },
  
  // Additional
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Grey Scale
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

export type Colors = typeof colors;
